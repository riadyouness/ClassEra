// routes/category.routes.js
const express = require('express');
const router = express.Router();

const {
  getCategories,
  getCategoriesProduct,
  getCategoriesProduct_fr,
  getCategoriesProduct_ar,

  getCategorieBySlug,
  getCategorieBySlug_fr,
  getCategorieBySlug_ar,

  getCategorieByProductSlug,
  getCategorieByProductSlug_fr,
  getCategorieByProductSlug_ar,

  createPostCategorie,
  UpdateCategorie,
  deleteCategorie
} = require('../controllers/categoryController');

/* ===================== GROUPED CATEGORIES ===================== */
router.get('/product', getCategoriesProduct);
router.get('/product/fr', getCategoriesProduct_fr);
router.get('/product/ar', getCategoriesProduct_ar);

/* ===================== READ ALL ===================== */
router.get('/', getCategories);

/* ===================== READ ONE (BY SLUG) ===================== */
router.get('/en/slug/:slug', getCategorieBySlug);
router.get('/fr/slug/:slug', getCategorieBySlug_fr);
router.get('/ar/slug/:slug', getCategorieBySlug_ar);

router.get('/en/product/slug/:slug', getCategorieByProductSlug);
router.get('/fr/product/slug/:slug', getCategorieByProductSlug_fr);
router.get('/ar/product/slug/:slug', getCategorieByProductSlug_ar);

/* ===================== CREATE ===================== */
router.post('/', createPostCategorie);

/* ===================== UPDATE ===================== */
router.put('/:id', UpdateCategorie);

/* ===================== DELETE ===================== */
router.delete('/:id', deleteCategorie);

module.exports = router;