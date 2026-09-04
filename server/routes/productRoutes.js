import express from 'express';
import multer from 'multer';
import {
  getProducts, getProductById, getFeatured, getNewArrivals, getBestSellers,
  getBrands, getCategories, addReview, createProduct, updateProduct, deleteProduct,
  searchSuggestions, importProductsCsv, uploadProductImage,
} from '../controllers/productController.js';
import { protectUser, protectAdmin } from '../middleware/authMiddleware.js';
import { validateProductInput } from '../middleware/productValidation.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

const router = express.Router();

router.get('/search/suggest', searchSuggestions);
router.get('/', getProducts);
router.get('/featured', getFeatured);
router.get('/new-arrivals', getNewArrivals);
router.get('/best-sellers', getBestSellers);
router.get('/brands', getBrands);
router.get('/categories', getCategories);
router.get('/:id', getProductById);
router.post('/:id/reviews', protectUser, addReview);

// Admin-only product management & uploads
router.post('/upload-image', protectAdmin, upload.single('image'), uploadProductImage);
router.post('/import-csv', protectAdmin, upload.single('file'), importProductsCsv);
router.post('/', protectAdmin, validateProductInput, createProduct);
router.put('/:id', protectAdmin, validateProductInput, updateProduct);
router.delete('/:id', protectAdmin, deleteProduct);

export default router;
