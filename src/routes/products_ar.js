const express = require("express");
const router = express.Router();

const {
    getPaginatedProducts_ar,
    getLastProduct_ar,
    getArrivalsProduct_ar,
    getDiscoutProduct_ar,
    getQualityProduct_ar,
    getProductBySlug_ar,
    getCategories_grouped_ar,
    getColors_ar,
    getSizes_ar
} = require("../controllers/productArController");

// --- Routes des listes de produits ---
router.get("/last/", getLastProduct_ar);
router.get("/arrivals", getArrivalsProduct_ar);
router.get("/discounts", getDiscoutProduct_ar);
router.get("/premium", getQualityProduct_ar);

// --- Routes de recherche et détails ---
router.get("/search/page/:page", getPaginatedProducts_ar);
router.get("/slug/:slug", getProductBySlug_ar);

// --- Routes des filtres (Sidebar) ---
router.get("/categories", getCategories_grouped_ar);
router.get("/colors", getColors_ar);
router.get("/sizes", getSizes_ar);

module.exports = router;