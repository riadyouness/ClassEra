const express = require("express");
const router = express.Router();
const {
    adminProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    adminOrders,
} = require("../controllers/adminController");
router.get("/products", adminProducts);
router.post("/products/", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

router.get("/orders", adminOrders);


module.exports = router;