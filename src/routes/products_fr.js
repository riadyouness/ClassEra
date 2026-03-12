const express = require("express");
const router = express.Router();
const {
    getPaginatedProducts_fr,
    getLastProduct_fr,
    getArrivalsProduct_fr,
    getDiscoutProduct_fr,
    getQualityProduct_fr,

    getProductBySlug_fr,
    getCategories_grouped_fr,
    getColors_fr,
    getSizes_fr

} = require("../controllers/productFrController");

router.get("/last/", getLastProduct_fr);
router.get("/arrivals", getArrivalsProduct_fr);
router.get("/discounts", getDiscoutProduct_fr);
router.get("/premium", getQualityProduct_fr);


router.get("/search/page/:page", getPaginatedProducts_fr);
router.get("/slug/:slug", getProductBySlug_fr);
router.get("/categories", getCategories_grouped_fr);
router.get("/colors", getColors_fr);
router.get("/sizes", getSizes_fr);


module.exports = router;