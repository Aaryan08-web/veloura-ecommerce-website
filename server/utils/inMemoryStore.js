import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

let MASTER_CATALOG = [];
try {
  const jsonPath = path.resolve(process.cwd(), 'server/seed/masterProducts.json');
  if (fs.existsSync(jsonPath)) {
    const raw = fs.readFileSync(jsonPath, 'utf8');
    MASTER_CATALOG = JSON.parse(raw);
  }
} catch (e) {
  console.warn('Could not read masterProducts.json', e);
}

const COLORS = {
  black: { name: 'Onyx Black', hex: '#121212' },
  white: { name: 'Chalk White', hex: '#F4F2EE' },
  navy: { name: 'Deep Navy', hex: '#1B2430' },
  camel: { name: 'Camel Melange', hex: '#C19A6B' },
  olive: { name: 'Washed Olive', hex: '#4A5340' },
  rose: { name: 'Rose Nude', hex: '#E8B4B8' },
  brown: { name: 'Espresso', hex: '#3A2E2B' },
};

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=80`;

const INITIAL_PRODUCTS = [
  {
    _id: '66e1a0000000000000000001',
    id: '66e1a0000000000000000001',
    name: 'Aura Heavyweight Boxy Tee',
    slug: 'aura-heavyweight-boxy-tee',
    brand: 'Veloura',
    department: 'clothing',
    category: 'T-Shirts',
    gender: 'men',
    price: 75,
    originalPrice: 90,
    discount: 17,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [COLORS.black, COLORS.white, COLORS.olive],
    images: [img('photo-1521572267360-ee0c2909d518'), img('photo-1583743814966-8936f5b7be1a')],
    rating: 4.8,
    reviewCount: 42,
    reviews: [
      {
        id: 'rev-1',
        author: 'Marcus V.',
        rating: 5,
        title: 'Best quality heavyweight tee',
        comment: 'The fit is perfection, heavy fabric that keeps its shape.',
        verifiedPurchase: true,
        createdAt: new Date().toISOString(),
      },
    ],
    isNew: true,
    isFeatured: true,
    isBestSeller: true,
    stock: 40,
    material: '100% Combed Organic Cotton (280 GSM)',
    fit: 'Boxy oversized',
    careInstructions: ['Machine wash cold', 'Lay flat to dry'],
    details: ['Ribbed collar', 'Pre-shrunk'],
    isActive: true,
  },
  {
    _id: '66e1a0000000000000000002',
    id: '66e1a0000000000000000002',
    name: 'Classic Oxford Shirt',
    slug: 'classic-oxford-shirt',
    brand: 'Veloura',
    department: 'clothing',
    category: 'Shirts',
    gender: 'men',
    price: 95,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [COLORS.white, COLORS.navy],
    images: [img('photo-1602810318383-e386cc2a3ccf'), img('photo-1596755094514-f87e34085b2c')],
    rating: 4.6,
    reviewCount: 30,
    reviews: [],
    isFeatured: true,
    stock: 35,
    material: '100% Cotton Oxford',
    fit: 'Slim tailored',
    careInstructions: ['Machine wash warm', 'Iron medium'],
    details: ['Button-down collar', 'Mother of Pearl buttons'],
    isActive: true,
  },
  {
    _id: '66e1a0000000000000000003',
    id: '66e1a0000000000000000003',
    name: 'Straight Fit Denim Jeans',
    slug: 'straight-fit-denim-jeans',
    brand: 'Denimworks',
    department: 'clothing',
    category: 'Jeans',
    gender: 'men',
    price: 120,
    sizes: ['30', '32', '34', '36', '38'],
    colors: [COLORS.navy, COLORS.black],
    images: [img('photo-1542272604-787c3835535d'), img('photo-1541099649105-f69ad21f3246')],
    rating: 4.5,
    reviewCount: 58,
    reviews: [],
    isBestSeller: true,
    stock: 50,
    material: 'Stretch Denim',
    fit: 'Straight',
    careInstructions: ['Wash cold inside out', 'Line dry'],
    details: ['13oz Japanese denim', 'Copper rivets'],
    isActive: true,
  },
  {
    _id: '66e1a0000000000000000004',
    id: '66e1a0000000000000000004',
    name: 'Essential Pullover Hoodie',
    slug: 'essential-pullover-hoodie',
    brand: 'Veloura',
    department: 'clothing',
    category: 'Hoodies',
    gender: 'unisex',
    price: 85,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [COLORS.black, COLORS.olive, COLORS.camel],
    images: [img('photo-1556821840-3a63f95609a7'), img('photo-1578587018452-892bacefd3f2')],
    rating: 4.7,
    reviewCount: 65,
    reviews: [],
    isNew: true,
    isFeatured: true,
    stock: 60,
    material: 'Cotton Fleece (400 GSM)',
    fit: 'Relaxed',
    careInstructions: ['Machine wash cold'],
    details: ['Double-layer hood', 'No drawstrings for minimal aesthetic'],
    isActive: true,
  },
  {
    _id: '66e1a0000000000000000005',
    id: '66e1a0000000000000000005',
    name: 'Double-Faced Wool Atelier Coat',
    slug: 'double-faced-wool-atelier-coat',
    brand: 'Veloura Atelier',
    department: 'clothing',
    category: 'Jackets',
    gender: 'men',
    price: 385,
    sizes: ['38R', '40R', '42R', '44R'],
    colors: [COLORS.black, COLORS.camel],
    images: [img('photo-1544923246-77307dd654cb'), img('photo-1539571696357-5a69c17a67c6')],
    rating: 4.9,
    reviewCount: 18,
    reviews: [],
    isFeatured: true,
    stock: 12,
    material: '90% Virgin Wool, 10% Cashmere',
    fit: 'Tailored overcoat',
    careInstructions: ['Specialist dry clean only'],
    details: ['Hand-finished perimeter', 'Horn buttons'],
    isActive: true,
  },
  {
    _id: '66e1a0000000000000000006',
    id: '66e1a0000000000000000006',
    name: 'Siren Column Backless Maxi Dress',
    slug: 'siren-column-backless-maxi-dress',
    brand: 'Veloura Atelier',
    department: 'clothing',
    category: 'Dresses',
    gender: 'women',
    price: 260,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [COLORS.black],
    images: [img('photo-1595777457583-95e059d581b8'), img('photo-1566174053879-31528523f8ae')],
    rating: 4.8,
    reviewCount: 24,
    reviews: [],
    isFeatured: true,
    isBestSeller: true,
    stock: 15,
    material: 'Silk Blend Italian Crepe',
    fit: 'Column silhouette',
    careInstructions: ['Dry clean only'],
    details: ['Low cowl back', 'Floor skimming side vent'],
    isActive: true,
  },
  {
    _id: '66e1a0000000000000000007',
    id: '66e1a0000000000000000007',
    name: 'Mulberry Silk Asymmetric Top',
    slug: 'mulberry-silk-asymmetric-top',
    brand: 'Veloura Atelier',
    department: 'clothing',
    category: 'Tops',
    gender: 'women',
    price: 160,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [{ name: 'Champagne Pearl', hex: '#EDE6D6' }],
    images: [img('photo-1534528741775-53994a69daeb'), img('photo-1509631179647-0177331693ae')],
    rating: 4.6,
    reviewCount: 20,
    reviews: [],
    stock: 22,
    material: '100% Grade 6A Mulberry Silk',
    fit: 'Asymmetric relaxed',
    careInstructions: ['Dry clean or delicate cold hand wash'],
    details: ['One-shoulder drape', 'French seams'],
    isActive: true,
  },
  {
    _id: '66e1a0000000000000000008',
    id: '66e1a0000000000000000008',
    name: 'Tailored Wide-Leg Trousers',
    slug: 'tailored-wide-leg-trousers',
    brand: 'Veloura',
    department: 'clothing',
    category: 'Trousers',
    gender: 'women',
    price: 140,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [COLORS.black, COLORS.navy],
    images: [img('photo-1594633312681-425c7b97ccd1'), img('photo-1509631179647-0177331693ae')],
    rating: 4.5,
    reviewCount: 27,
    reviews: [],
    stock: 30,
    material: 'Wool Blend Tropical Weave',
    fit: 'Wide leg high-rise',
    careInstructions: ['Dry clean'],
    details: ['Front reverse pleats', 'Concealed hook closure'],
    isActive: true,
  },
  {
    _id: '66e1a0000000000000000009',
    id: '66e1a0000000000000000009',
    name: 'Runner Pro Sneakers',
    slug: 'runner-pro-sneakers',
    brand: 'Nova Athletic',
    department: 'shoes',
    category: 'Sneakers',
    gender: 'unisex',
    price: 130,
    sizes: ['6', '7', '8', '9', '10', '11'],
    colors: [COLORS.white, COLORS.black],
    images: [img('photo-1542291026-7eec264c27ff')],
    rating: 4.7,
    reviewCount: 89,
    reviews: [],
    isBestSeller: true,
    isFeatured: true,
    stock: 70,
    material: 'Mesh & Rubber',
    fit: 'True to size',
    careInstructions: ['Wipe clean with soft brush'],
    details: ['Responsive dual-density foam', 'Recycled TPU overlays'],
    isActive: true,
  },
  {
    _id: '66e1a0000000000000000010',
    id: '66e1a0000000000000000010',
    name: 'Classic Leather Chelsea Boots',
    slug: 'classic-leather-chelsea-boots',
    brand: 'Heritage & Co.',
    department: 'shoes',
    category: 'Boots',
    gender: 'men',
    price: 210,
    sizes: ['7', '8', '9', '10', '11', '12'],
    colors: [COLORS.brown, COLORS.black],
    images: [img('photo-1608256246200-53e635b5b65f')],
    rating: 4.8,
    reviewCount: 46,
    reviews: [],
    isFeatured: true,
    stock: 25,
    material: 'Full-Grain Leather',
    fit: 'Regular',
    careInstructions: ['Condition with leather balm'],
    details: ['Goodyear welted sole', 'Elastic side gusset'],
    isActive: true,
  },
  {
    _id: '66e1a0000000000000000011',
    id: '66e1a0000000000000000011',
    name: 'Velvet Matte Lipstick',
    slug: 'velvet-matte-lipstick',
    brand: 'Lumière Beauty',
    department: 'cosmetics',
    category: 'Lips',
    gender: 'women',
    price: 28,
    sizes: [],
    colors: [{ name: 'Rouge Noir', hex: '#8B1E3F' }, { name: 'Nude Rose', hex: '#C98B83' }],
    images: [img('photo-1586495777744-4413f21062fa')],
    rating: 4.6,
    reviewCount: 120,
    reviews: [],
    isBestSeller: true,
    isFeatured: true,
    stock: 100,
    material: 'Vegan Formula',
    fit: '',
    careInstructions: ['Store in cool dry place'],
    details: ['12-hour weightless wear', 'Infused with jojoba seed oil'],
    isActive: true,
  },
  {
    _id: '66e1a0000000000000000012',
    id: '66e1a0000000000000000012',
    name: 'Leather Crossbody Bag',
    slug: 'leather-crossbody-bag',
    brand: 'Heritage & Co.',
    department: 'accessories',
    category: 'Bags',
    gender: 'women',
    price: 175,
    sizes: [],
    colors: [COLORS.black, COLORS.brown],
    images: [img('photo-1584917865442-de89df76afd3')],
    rating: 4.7,
    reviewCount: 41,
    reviews: [],
    isFeatured: true,
    stock: 22,
    material: 'Full-Grain Italian Calf Leather',
    fit: '',
    careInstructions: ['Wipe with clean damp cloth'],
    details: ['Magnetic closure flap', 'Adjustable crossbody strap'],
    isActive: true,
  },
];

// In-memory collections
const mergedCatalog = [...INITIAL_PRODUCTS];
const existingCatalogIds = new Set(mergedCatalog.map((p) => String(p._id || p.id).toLowerCase()));

MASTER_CATALOG.forEach((item) => {
  const rawId = String(item.id || item._id || '').toLowerCase();
  if (rawId && !existingCatalogIds.has(rawId)) {
    const slug = item.slug || (item.name ? item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : rawId);
    mergedCatalog.push({
      _id: item.id || item._id,
      id: item.id || item._id,
      slug,
      department: item.department || 'clothing',
      brand: item.brand || 'Veloura',
      isActive: true,
      reviews: item.reviews || [],
      ...item,
    });
    existingCatalogIds.add(rawId);
  }
});

let productsStore = mergedCatalog;
let usersStore = [];
let adminsStore = [];
let cartsStore = new Map(); // userId -> cart object
let wishlistsStore = new Map(); // userId -> array of productIds
let ordersStore = [];
let contactsStore = [];

// In-memory collections
const mergedCatalog = [...INITIAL_PRODUCTS];
const existingCatalogIds = new Set(mergedCatalog.map((p) => String(p._id || p.id).toLowerCase()));

MASTER_CATALOG.forEach((item) => {
  const rawId = String(item.id || item._id || '').toLowerCase();
  if (rawId && !existingCatalogIds.has(rawId)) {
    const slug = item.slug || (item.name ? item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : rawId);
    mergedCatalog.push({
      _id: item.id || item._id,
      id: item.id || item._id,
      slug,
      department: item.department || 'clothing',
      brand: item.brand || 'Veloura',
      isActive: true,
      reviews: item.reviews || [],
      ...item,
    });
    existingCatalogIds.add(rawId);
  }
});

let productsStore = mergedCatalog;
let usersStore = [];
let adminsStore = [];
let cartsStore = new Map(); // userId -> cart object
let wishlistsStore = new Map(); // userId -> array of productIds
let ordersStore = [];
let contactsStore = [];
  products: {
    find: (filter = {}) => {
      let list = [...productsStore];
      if (filter.isActive !== undefined) list = list.filter((p) => p.isActive === filter.isActive);
      if (filter.department) list = list.filter((p) => p.department === filter.department);
      if (filter.category) list = list.filter((p) => p.category.toLowerCase() === filter.category.toLowerCase());
      if (filter.gender && filter.gender !== 'all') {
        list = list.filter((p) => p.gender === filter.gender || p.gender === 'unisex');
      }
      if (filter.isFeatured) list = list.filter((p) => p.isFeatured);
      if (filter.isNew) list = list.filter((p) => p.isNew);
      if (filter.isBestSeller) list = list.filter((p) => p.isBestSeller);
      if (filter.search) {
        const q = filter.search.toLowerCase();
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        );
      }
      if (filter.minPrice !== undefined) list = list.filter((p) => p.price >= filter.minPrice);
      if (filter.maxPrice !== undefined) list = list.filter((p) => p.price <= filter.maxPrice);
      return list;
    },
    findById: (id) => {
      const q = String(id || '').trim().toLowerCase();
      if (!q) return null;
      return productsStore.find(
        (p) =>
          String(p._id || '').toLowerCase() === q ||
          String(p.id || '').toLowerCase() === q ||
          String(p.slug || '').toLowerCase() === q ||
          (p.name && p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === q)
      );
    },
    findBySlug: (slug) => {
      const q = String(slug || '').trim().toLowerCase();
      if (!q) return null;
      return productsStore.find(
        (p) =>
          String(p.slug || '').toLowerCase() === q ||
          String(p.id || '').toLowerCase() === q ||
          String(p._id || '').toLowerCase() === q ||
          (p.name && p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === q)
      );
    },
    distinct: (field) => {
      const set = new Set();
      productsStore.forEach((p) => {
        if (p[field]) set.add(p[field]);
      });
      return Array.from(set);
    },
    create: (data) => {
      const id = `prod_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const newProd = { _id: id, id, rating: 0, reviewCount: 0, reviews: [], isActive: true, ...data };
      productsStore.push(newProd);
      return newProd;
    },
    insertMany: (items) => {
      const created = [];
      for (const data of items) {
        const id = data._id || `prod_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const newProd = { _id: id, id, rating: data.rating || 0, reviewCount: data.reviewCount || 0, reviews: data.reviews || [], isActive: true, ...data };
        productsStore.push(newProd);
        created.push(newProd);
      }
      return created;
    },
    update: (id, data) => {
      const idx = productsStore.findIndex((p) => String(p._id) === String(id) || String(p.id) === String(id));
      if (idx === -1) return null;
      productsStore[idx] = { ...productsStore[idx], ...data };
      return productsStore[idx];
    },
    delete: (id) => {
      const idx = productsStore.findIndex((p) => String(p._id) === String(id) || String(p.id) === String(id));
      if (idx === -1) return false;
      productsStore.splice(idx, 1);
      return true;
    },
  },
  users: {
    findByEmail: (email) => usersStore.find((u) => u.email.toLowerCase() === email.toLowerCase()),
    findById: (id) => usersStore.find((u) => String(u._id) === String(id) || String(u.id) === String(id)),
    create: (data) => {
      const id = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const newUser = {
        _id: id,
        id,
        role: 'user',
        isActive: true,
        savedAddresses: [],
        createdAt: new Date().toISOString(),
        ...data,
        password: hashPassword(data.password),
      };
      usersStore.push(newUser);
      return newUser;
    },
    getAll: () => usersStore.map(({ password, ...rest }) => rest),
  },
  admins: {
    findByEmail: (email) => adminsStore.find((a) => a.email.toLowerCase() === email.toLowerCase()),
    findById: (id) => adminsStore.find((a) => String(a._id) === String(id) || String(a.id) === String(id)),
    create: (data) => {
      const id = `adm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const newAdmin = {
        _id: id,
        id,
        role: adminsStore.length === 0 ? 'superadmin' : 'admin',
        isActive: true,
        createdAt: new Date().toISOString(),
        ...data,
        password: hashPassword(data.password),
      };
      adminsStore.push(newAdmin);
      return newAdmin;
    },
    count: () => adminsStore.length,
  },
  cart: {
    get: (userId) => {
      const uId = String(userId);
      if (!cartsStore.has(uId)) {
        cartsStore.set(uId, { user: uId, items: [], couponCode: undefined });
      }
      const raw = cartsStore.get(uId);
      // Populate products
      const populatedItems = raw.items.map((item) => {
        const prod = memoryDb.products.findById(item.product);
        return {
          ...item,
          product: prod || { id: item.product, name: 'Product', price: 0, images: [] },
        };
      });
      return { ...raw, items: populatedItems };
    },
    save: (userId, cartData) => {
      const uId = String(userId);
      cartsStore.set(uId, { ...cartData, user: uId });
      return memoryDb.cart.get(uId);
    },
  },
  wishlist: {
    get: (userId) => {
      const uId = String(userId);
      const productIds = wishlistsStore.get(uId) || [];
      const populatedProducts = productIds
        .map((pId) => memoryDb.products.findById(pId))
        .filter(Boolean);
      return { user: uId, products: populatedProducts };
    },
    toggle: (userId, productId) => {
      const uId = String(userId);
      const pId = String(productId);
      const list = wishlistsStore.get(uId) || [];
      const idx = list.indexOf(pId);
      if (idx > -1) {
        list.splice(idx, 1);
      } else {
        list.push(pId);
      }
      wishlistsStore.set(uId, list);
      return memoryDb.wishlist.get(uId);
    },
    clear: (userId) => {
      const uId = String(userId);
      wishlistsStore.set(uId, []);
      return { user: uId, products: [] };
    },
  },
  orders: {
    create: (data) => {
      const id = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const newOrder = {
        _id: id,
        id,
        orderNumber: `VEL-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'processing',
        createdAt: new Date().toISOString(),
        trackingNumber: `1Z${Math.floor(10000000 + Math.random() * 90000000)}`,
        trackingUpdates: [{ status: 'Order Placed', description: 'Order confirmed and receipt generated.' }],
        ...data,
      };
      ordersStore.unshift(newOrder);
      return newOrder;
    },
    getByUser: (userId) => ordersStore.filter((o) => String(o.user) === String(userId)),
    getById: (id) => ordersStore.find((o) => String(o._id) === String(id) || String(o.id) === String(id) || o.orderNumber === id),
    getAll: () => ordersStore,
  },
  contacts: {
    create: (data) => {
      const id = `cnt_${Date.now()}`;
      const msg = { _id: id, id, status: 'new', createdAt: new Date().toISOString(), ...data };
      contactsStore.unshift(msg);
      return msg;
    },
    getAll: () => contactsStore,
    updateStatus: (id, status) => {
      const c = contactsStore.find((item) => String(item._id) === String(id) || String(item.id) === String(id));
      if (c) c.status = status;
      return c;
    },
  },
};

export const getMemoryProducts = () => productsStore;
