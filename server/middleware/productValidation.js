export const validateProductInput = (req, res, next) => {
  const { name, price, category, brand, stock, description, images, sizes, colors, discount } = req.body || {};
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim() === '') {
    errors.push('Product name is required and must be a valid string.');
  }

  if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
    errors.push('Valid product price is required and must be a non-negative number.');
  }

  if (!category || typeof category !== 'string' || category.trim() === '') {
    errors.push('Product category is required.');
  }

  if (!brand || typeof brand !== 'string' || brand.trim() === '') errors.push('Product brand is required.');
  if (description !== undefined && (typeof description !== 'string' || description.trim().length > 4000)) errors.push('Description must be a string of no more than 4,000 characters.');

  if (stock !== undefined && (isNaN(Number(stock)) || Number(stock) < 0)) {
    errors.push('Stock quantity must be a non-negative number.');
  }
  if (discount !== undefined && (isNaN(Number(discount)) || Number(discount) < 0 || Number(discount) > 100)) errors.push('Discount must be a number between 0 and 100.');
  if (images !== undefined && (!Array.isArray(images) || images.length > 8 || images.some((url) => typeof url !== 'string' || !/^https?:\/\//i.test(url)))) errors.push('Images must contain up to 8 valid HTTP(S) URLs.');
  if (sizes !== undefined && (!Array.isArray(sizes) || sizes.some((size) => typeof size !== 'string' || !size.trim()))) errors.push('Sizes must be an array of non-empty strings.');
  if (colors !== undefined && (!Array.isArray(colors) || colors.some((color) => !color || typeof color.name !== 'string' || !color.name.trim()))) errors.push('Colors must be an array of objects with a name.');

  if (errors.length > 0) {
    return res.status(422).json({
      message: 'Validation failed for product payload.',
      errors,
    });
  }

  req.body.name = name.trim();
  req.body.category = category.trim();
  req.body.brand = brand.trim();
  req.body.price = Number(price);
  if (stock !== undefined) req.body.stock = Number(stock);
  if (discount !== undefined) req.body.discount = Number(discount);
  next();
};
