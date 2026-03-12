const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getPaginatedProducts,
  getLastProduct,
  getLastAllProduct,
  getDiscountProduct,
  getQualityProduct,


  getProductById,
  getProductBySlug,


  CartProducts,

  createProductAlbum,
  createProduct,
  createProduct_ar,
  createProduct_fr,

  updateProduct,
  updateProductAlbum,
  updateProduct_ar,
  updateProduct_fr,

  getCategories,
  getSizes,
  getColors,


} = require("../controllers/productController");

router.get("/", getAllProducts);
router.get("/last", getLastProduct);
router.get("/arrivals", getLastAllProduct);
router.get("/discounts", getDiscountProduct);
router.get("/premium", getQualityProduct);
router.get("/search/page/:page", getPaginatedProducts);


router.get("/id/:id", getProductById);
router.get("/slug/:slug", getProductBySlug);

router.get("/cart/", CartProducts);





router.post("/", createProduct);
router.post("/ar", createProduct_ar);
router.post("/fr", createProduct_fr);
router.post("/images", createProductAlbum);



router.put("/:id", updateProduct);
router.put("/:id/ar", updateProduct_ar);
router.put("/:id/fr", updateProduct_fr);
router.put("/images/:id", updateProductAlbum);

router.get("/categories", getCategories);
router.get("/colors", getColors);
router.get("/sizes", getSizes);


module.exports = router;