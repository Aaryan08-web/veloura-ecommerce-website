import Product from '../models/Product.js';
import { isDbConnected } from '../config/db.js';
import { memoryDb } from '../utils/inMemoryStore.js';
import csvParser from 'csv-parser';
import { Readable } from 'stream';

/**
 * GET /api/products/search/suggest?q=...
 * Live autocomplete suggestions for navbar search
 */
export const searchSuggestions = async (req, res) => {
  try {
    const query = (req.query.q || '').trim();
    if (!query || query.length < 1) {
      return res.json({ suggestions: [] });
    }

    const regex = new RegExp(query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');

    if (!isDbConnected()) {
      const all = memoryDb.products.find({ isActive: true });
      const matched = all
        .filter(
          (p) =>
            regex.test(p.name) ||
            regex.test(p.category) ||
            regex.test(p.brand) ||
            regex.test(p.department)
        )
        .slice(0, 8)
        .map((p) => ({
          id: p.id || p._id,
          name: p.name,
          category: p.category,
          brand: p.brand,
          price: p.price,
          originalPrice: p.originalPrice,
          discount: p.discount,
          stock: typeof p.stock === 'number' ? p.stock : 10,
          images: p.images || [],
          rating: p.rating || 0,
        }));

      return res.json({ suggestions: matched });
    }

    const products = await Product.find({
      isActive: true,
      $or: [
        { name: { $regex: regex } },
        { category: { $regex: regex } },
        { brand: { $regex: regex } },
        { department: { $regex: regex } },
      ],
    })
      .select('name category brand department price originalPrice discount stock images rating')
      .limit(8)
      .lean();

    const formatted = products.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      category: p.category,
      brand: p.brand,
      price: p.price,
      originalPrice: p.originalPrice,
      discount: p.discount,
      stock: typeof p.stock === 'number' ? p.stock : 0,
      images: p.images || [],
      rating: p.rating || 0,
    }));

    res.json({ suggestions: formatted });
  } catch (err) {
    res.status(500).json({ message: 'Failed to search suggestions.', error: err.message });
  }
};

/**
 * Parses raw CSV buffer into structured product documents with validation
 */
const parseAndValidateCsv = (buffer) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from(buffer.toString('utf-8'));

    stream
      .pipe(
        csvParser({
          mapHeaders: ({ header }) =>
            header.trim().toLowerCase().replace(/[^a-z0-9]/g, ''),
        })
      )
      .on('data', (row) => results.push(row))
      .on('end', () => {
        const validProducts = [];
        const failedRows = [];

        results.forEach((row, index) => {
          const rowNum = index + 2; // header is row 1
          const name = (row.name || row.productname || row.title || '').trim();
          const description = (row.description || row.desc || row.details || '').trim();
          const category = (row.category || row.type || '').trim();
          const priceRaw = parseFloat(row.price || row.mrp || 0);

          if (!name) {
            failedRows.push({ row: rowNum, error: 'Product name is required.' });
            return;
          }
          if (isNaN(priceRaw) || priceRaw <= 0) {
            failedRows.push({ row: rowNum, error: `Invalid price for "${name}". Must be a positive number.` });
            return;
          }
          if (!category) {
            failedRows.push({ row: rowNum, error: `Category is required for "${name}".` });
            return;
          }

          const discount = parseFloat(row.discount || 0) || 0;
          const stock = parseInt(row.stock || row.inventory || row.qty || 15, 10);
          const brand = (row.brand || 'Veloura').trim();
          const departmentRaw = (row.department || 'clothing').trim().toLowerCase();
          const validDepartments = ['clothing', 'cosmetics', 'shoes', 'accessories'];
          const department = validDepartments.includes(departmentRaw) ? departmentRaw : 'clothing';
          const genderRaw = (row.gender || 'unisex').trim().toLowerCase();
          const gender = ['men', 'women', 'unisex'].includes(genderRaw) ? genderRaw : 'unisex';

          // Parse sizes
          let sizes = ['S', 'M', 'L', 'XL'];
          const sizesStr = row.sizes || row.size || '';
          if (sizesStr) {
            sizes = sizesStr
              .split(/[,;|]/)
              .map((s) => s.trim())
              .filter(Boolean);
          }

          // Parse colors
          let colors = [{ name: 'Default', hex: '#121212' }];
          const colorsStr = row.colors || row.color || '';
          if (colorsStr) {
            const rawColors = colorsStr.split(/[,;|]/).map((c) => c.trim()).filter(Boolean);
            colors = rawColors.map((c) => {
              if (c.includes(':') || c.includes('#')) {
                const parts = c.split(':');
                return { name: parts[0].trim(), hex: (parts[1] || '#121212').trim() };
              }
              const defaultHexMap = {
                black: '#121212',
                white: '#F4F2EE',
                navy: '#1B2430',
                camel: '#C19A6B',
                olive: '#4A5340',
                rose: '#E8B4B8',
                brown: '#3A2E2B',
                grey: '#808080',
                gray: '#808080',
                blue: '#2563EB',
                green: '#16A34A',
                red: '#DC2626',
              };
              return {
                name: c,
                hex: defaultHexMap[c.toLowerCase()] || '#121212',
              };
            });
          }

          // Parse images
          let images = ['https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80'];
          const imagesStr = row.images || row.image || row.imageurls || row.imageurl || '';
          if (imagesStr) {
            const parsedUrls = imagesStr
              .split(/[,;|]/)
              .map((url) => url.trim())
              .filter((url) => url.startsWith('http://') || url.startsWith('https://'));
            if (parsedUrls.length > 0) {
              images = parsedUrls;
            }
          }

          const originalPrice = discount > 0 ? Math.round(priceRaw / (1 - discount / 100)) : undefined;

          validProducts.push({
            name,
            description: description || `${name} by ${brand}. Masterfully crafted for the modern luxury aesthetic.`,
            category,
            brand,
            department,
            gender,
            price: priceRaw,
            originalPrice,
            discount: discount > 0 ? discount : undefined,
            stock: isNaN(stock) ? 10 : Math.max(0, stock),
            sizes: sizes.length > 0 ? sizes : ['One Size'],
            colors,
            images,
            rating: parseFloat(row.rating || 5) || 5,
            reviewCount: parseInt(row.reviewcount || 0, 10) || 0,
            isNew: row.isnew === 'true' || row.isnew === '1',
            isFeatured: row.isfeatured === 'true' || row.isfeatured === '1',
            isBestSeller: row.isbestseller === 'true' || row.isbestseller === '1',
            material: (row.material || row.fabric || '').trim() || undefined,
            fit: (row.fit || '').trim() || undefined,
            isActive: true,
          });
        });

        resolve({ validProducts, failedRows, totalRows: results.length });
      })
      .on('error', (err) => reject(err));
  });
};

/**
 * POST /api/products/import-csv (Admin Only)
 * Handles bulk product CSV upload, validation, and bulk database insert
 */
export const importProductsCsv = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: 'No CSV file was uploaded.' });
    }

    const { validProducts, failedRows, totalRows } = await parseAndValidateCsv(req.file.buffer);

    if (validProducts.length === 0) {
      return res.status(400).json({
        message: 'No valid product rows could be parsed from the CSV file.',
        total: totalRows,
        added: 0,
        failed: failedRows.length,
        errors: failedRows,
      });
    }

    if (!isDbConnected()) {
      const created = memoryDb.products.insertMany(validProducts);
      return res.status(201).json({
        message: `Successfully imported ${created.length} products to catalogue.`,
        total: totalRows,
        added: created.length,
        failed: failedRows.length,
        errors: failedRows,
        products: created,
      });
    }

    // MongoDB Bulk Insert
    const inserted = await Product.insertMany(validProducts, { ordered: false });

    res.status(201).json({
      message: `Successfully imported ${inserted.length} products to database.`,
      total: totalRows,
      added: inserted.length,
      failed: failedRows.length,
      errors: failedRows,
      products: inserted,
    });
  } catch (err) {
    console.error('CSV import error:', err);
    res.status(500).json({ message: 'Failed to process CSV file.', error: err.message });
  }
};

// GET /api/products  (public) — supports filters, search, sort, pagination
export const getProducts = async (req, res) => {
  try {
    const {
      department, category, brand, gender, search,
      minPrice, maxPrice, sizes, colors, minRating,
      inStockOnly, isNew, isFeatured, isBestSeller, sort = 'featured', page = 1, limit = 50,
      includeInactive,
    } = req.query;

    if (!isDbConnected()) {
      let items = memoryDb.products.find({
        department,
        category,
        gender,
        search,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        isNew: isNew === 'true' ? true : undefined,
        isFeatured: isFeatured === 'true' ? true : undefined,
        isBestSeller: isBestSeller === 'true' ? true : undefined,
        isActive: includeInactive === 'true' ? undefined : true,
      });

      if (brand) {
        const brandList = brand.split(',');
        items = items.filter((p) => brandList.includes(p.brand));
      }
      if (sizes) {
        const sizeList = sizes.split(',');
        items = items.filter((p) => (p.sizes || []).some((s) => sizeList.includes(s)));
      }
      if (colors) {
        const colorList = colors.split(',');
        items = items.filter((p) => (p.colors || []).some((c) => colorList.includes(c.name)));
      }
      if (minRating) {
        items = items.filter((p) => p.rating >= Number(minRating));
      }
      if (inStockOnly === 'true') {
        items = items.filter((p) => p.stock > 0);
      }

      // Sort
      if (sort === 'newest') items.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      else if (sort === 'popular') items.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
      else if (sort === 'price-asc') items.sort((a, b) => a.price - b.price);
      else if (sort === 'price-desc') items.sort((a, b) => b.price - a.price);
      else if (sort === 'rating-desc') items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      else items.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));

      const pageNum = Math.max(1, Number(page));
      const limitNum = Math.min(100, Number(limit));
      const total = items.length;
      const paginated = items.slice((pageNum - 1) * limitNum, pageNum * limitNum);

      const formatted = paginated.map((p) => ({
        ...p,
        id: p.id || (p._id ? p._id.toString() : ''),
      }));

      return res.json({ products: formatted, total, page: pageNum, pages: Math.ceil(total / limitNum) });
    }

    const filter = {};
    if (includeInactive !== 'true') {
      filter.isActive = true;
    }
    if (department) filter.department = department;
    if (category) filter.category = category;
    if (brand) filter.brand = { $in: brand.split(',') };
    if (gender) filter.gender = { $in: [gender, 'unisex'] };
    if (minRating) filter.rating = { $gte: Number(minRating) };
    if (inStockOnly === 'true') filter.stock = { $gt: 0 };
    if (isNew === 'true') filter.isNew = true;
    if (isFeatured === 'true') filter.isFeatured = true;
    if (isBestSeller === 'true') filter.isBestSeller = true;
    if (sizes) filter.sizes = { $in: sizes.split(',') };
    if (colors) filter['colors.name'] = { $in: colors.split(',') };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) filter.$text = { $search: search };

    const sortMap = {
      featured: { isFeatured: -1, createdAt: -1 },
      newest: { createdAt: -1 },
      popular: { reviewCount: -1 },
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      'rating-desc': { rating: -1 },
    };

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Number(limit));

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortMap[sort] || sortMap.featured)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Product.countDocuments(filter),
    ]);

    const formatted = products.map((p) => {
      const obj = p.toObject ? p.toObject() : { ...p };
      return {
        ...obj,
        id: obj.id || (obj._id ? obj._id.toString() : ''),
      };
    });

    res.json({ products: formatted, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products.', error: err.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const rawId = (req.params.id || '').trim();
    if (!rawId) return res.status(400).json({ message: 'Product ID is required.' });

    if (!isDbConnected()) {
      const product = memoryDb.products.findById(rawId) || memoryDb.products.findBySlug(rawId);
      if (!product) return res.status(404).json({ message: 'Product not found.' });
      return res.json({
        product: {
          ...product,
          id: product.id || (product._id ? product._id.toString() : ''),
        },
      });
    }

    const isMongoId = /^[0-9a-fA-F]{24}$/.test(rawId);
    const orConditions = [
      { slug: rawId },
      { slug: rawId.toLowerCase() },
      { name: new RegExp(`^${rawId.replace(/[-_]/g, ' ')}$`, 'i') },
    ];
    if (isMongoId) {
      orConditions.unshift({ _id: rawId });
    }

    let product = await Product.findOne({ $or: orConditions });

    if (!product && isMongoId) {
      product = await Product.findById(rawId);
    }

    if (!product) {
      product = memoryDb.products.findById(rawId) || memoryDb.products.findBySlug(rawId);
    }

    if (!product) return res.status(404).json({ message: 'Product not found.' });
    const obj = product.toObject ? product.toObject() : { ...product };
    const formatted = {
      ...obj,
      id: obj.id || (obj._id ? obj._id.toString() : ''),
    };
    res.json({ product: formatted });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch product.', error: err.message });
  }
};

export const getFeatured = async (req, res) => {
  if (!isDbConnected()) {
    const list = memoryDb.products.find({ isFeatured: true, isActive: true }).slice(0, 12).map((p) => ({
      ...p,
      id: p.id || (p._id ? p._id.toString() : ''),
    }));
    return res.json({ products: list });
  }
  const products = await Product.find({ isFeatured: true, isActive: true }).limit(12);
  const formatted = products.map((p) => {
    const obj = p.toObject ? p.toObject() : { ...p };
    return { ...obj, id: obj.id || (obj._id ? obj._id.toString() : '') };
  });
  res.json({ products: formatted });
};

export const getNewArrivals = async (req, res) => {
  if (!isDbConnected()) {
    const list = memoryDb.products.find({ isNew: true, isActive: true }).slice(0, 12).map((p) => ({
      ...p,
      id: p.id || (p._id ? p._id.toString() : ''),
    }));
    return res.json({ products: list });
  }
  const products = await Product.find({ isNew: true, isActive: true }).limit(12);
  const formatted = products.map((p) => {
    const obj = p.toObject ? p.toObject() : { ...p };
    return { ...obj, id: obj.id || (obj._id ? obj._id.toString() : '') };
  });
  res.json({ products: formatted });
};

export const getBestSellers = async (req, res) => {
  if (!isDbConnected()) {
    const list = memoryDb.products.find({ isBestSeller: true, isActive: true }).slice(0, 12).map((p) => ({
      ...p,
      id: p.id || (p._id ? p._id.toString() : ''),
    }));
    return res.json({ products: list });
  }
  const products = await Product.find({ isBestSeller: true, isActive: true }).limit(12);
  const formatted = products.map((p) => {
    const obj = p.toObject ? p.toObject() : { ...p };
    return { ...obj, id: obj.id || (obj._id ? obj._id.toString() : '') };
  });
  res.json({ products: formatted });
};

export const getBrands = async (req, res) => {
  if (!isDbConnected()) {
    return res.json({ brands: memoryDb.products.distinct('brand') });
  }
  const brands = await Product.distinct('brand', { isActive: true });
  res.json({ brands });
};

export const getCategories = async (req, res) => {
  if (!isDbConnected()) {
    return res.json({ categories: memoryDb.products.distinct('category') });
  }
  const categories = await Product.distinct('category', { isActive: true });
  res.json({ categories });
};

export const addReview = async (req, res) => {
  try {
    const { rating, title, comment } = req.body;
    if (!isDbConnected()) {
      const product = memoryDb.products.findById(req.params.id);
      if (!product) return res.status(404).json({ message: 'Product not found.' });
      if (!product.reviews) product.reviews = [];
      product.reviews.push({
        id: `rev_${Date.now()}`,
        user: req.user?._id || 'user',
        author: req.user?.name || 'Customer',
        rating: Number(rating),
        title,
        comment,
        verifiedPurchase: true,
        createdAt: new Date().toISOString(),
      });
      product.reviewCount = product.reviews.length;
      product.rating = product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length;
      return res.status(201).json({ product });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    product.reviews.push({
      user: req.user._id,
      author: req.user.name,
      rating,
      title,
      comment,
      verifiedPurchase: true,
    });
    product.reviewCount = product.reviews.length;
    product.rating = product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length;
    await product.save();
    res.status(201).json({ product });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add review.', error: err.message });
  }
};

// ---------- ADMIN CRUD ----------

export const createProduct = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (!payload.name) {
      return res.status(400).json({ message: 'Product name is required.' });
    }
    if (payload.price === undefined || payload.price === null || Number(payload.price) < 0) {
      return res.status(400).json({ message: 'Valid product price is required.' });
    }

    payload.price = Number(payload.price);
    if (payload.originalPrice) payload.originalPrice = Number(payload.originalPrice);
    if (payload.discount) payload.discount = Number(payload.discount);
    if (payload.stock !== undefined) payload.stock = Math.max(0, Number(payload.stock));

    if (!payload.images || !Array.isArray(payload.images) || payload.images.length === 0) {
      payload.images = ['https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80'];
    }

    if (!payload.slug && payload.name) {
      payload.slug = payload.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);
    }

    if (!isDbConnected()) {
      const product = memoryDb.products.create(payload);
      return res.status(201).json({
        product: {
          ...product,
          id: product.id || product._id,
        },
        message: 'Product created and stored successfully.',
      });
    }

    const created = await Product.create(payload);
    const obj = created.toObject ? created.toObject() : { ...created };
    const formatted = {
      ...obj,
      id: obj.id || (obj._id ? obj._id.toString() : ''),
    };

    res.status(201).json({
      product: formatted,
      message: 'Product created and saved to MongoDB Atlas.',
    });
  } catch (err) {
    res.status(400).json({ message: 'Failed to create product in database.', error: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const rawId = req.params.id;
    const payload = { ...req.body };

    if (payload.price !== undefined) payload.price = Number(payload.price);
    if (payload.originalPrice !== undefined) payload.originalPrice = Number(payload.originalPrice);
    if (payload.discount !== undefined) payload.discount = Number(payload.discount);
    if (payload.stock !== undefined) payload.stock = Math.max(0, Number(payload.stock));

    if (!isDbConnected()) {
      const product = memoryDb.products.update(rawId, payload);
      if (!product) return res.status(404).json({ message: 'Product not found.' });
      return res.json({
        product: {
          ...product,
          id: product.id || product._id,
        },
        message: 'Product updated successfully.',
      });
    }

    let product = await Product.findByIdAndUpdate(rawId, payload, { new: true, runValidators: true });
    if (!product) {
      product = await Product.findOneAndUpdate({ slug: rawId }, payload, { new: true, runValidators: true });
    }

    if (!product) {
      const memoryFallback = memoryDb.products.update(rawId, payload);
      if (memoryFallback) {
        return res.json({ product: memoryFallback, message: 'Product updated.' });
      }
      return res.status(404).json({ message: 'Product not found.' });
    }

    const obj = product.toObject ? product.toObject() : { ...product };
    const formatted = {
      ...obj,
      id: obj.id || (obj._id ? obj._id.toString() : ''),
    };

    res.json({ product: formatted, message: 'Product updated in MongoDB.' });
  } catch (err) {
    res.status(400).json({ message: 'Failed to update product in database.', error: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const rawId = req.params.id;
    if (!isDbConnected()) {
      const success = memoryDb.products.delete(rawId);
      if (!success) return res.status(404).json({ message: 'Product not found.' });
      return res.json({ message: 'Product deleted from catalog.' });
    }

    let product = await Product.findByIdAndDelete(rawId);
    if (!product) {
      product = await Product.findOneAndDelete({ slug: rawId });
    }

    memoryDb.products.delete(rawId);

    if (!product) return res.status(404).json({ message: 'Product not found in database.' });
    res.json({ message: 'Product deleted from MongoDB.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product.', error: err.message });
  }
};

/**
 * Upload single image and return data URI or accessible URL
 */
export const uploadProductImage = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: 'No image file provided.' });
    }

    const mimeType = req.file.mimetype || 'image/jpeg';
    const base64Data = req.file.buffer.toString('base64');
    const dataUri = `data:${mimeType};base64,${base64Data}`;

    res.status(200).json({
      success: true,
      url: dataUri,
      message: 'Product image uploaded successfully.',
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to upload image.', error: err.message });
  }
};
