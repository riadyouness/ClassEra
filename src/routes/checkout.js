const express = require("express");
const router = express.Router();

const {
    getOrders,
    getOrderById,
    getOrderById_ar,
    getOrderById_fr,
    verifyCart,
    verifyCart_fr,
    verifyCart_ar,
    verifyCartIds,
    updateOrder,
    newOrder,
    saveOrder,
    deleteOrder
} = require("../controllers/checkoutController");

router.get("/", getOrders);

router.post("/verify/ids", verifyCartIds);
router.post("/verify", verifyCart);
router.post("/fr/verify", verifyCart_fr);
router.post("/ar/verify", verifyCart_ar);


router.post("/save-order", saveOrder);
router.post("/new-order", newOrder);
router.put("/update-order/:id", updateOrder);
router.delete("/delete-order/:id", deleteOrder);

router.get("/public/:id", getOrderById);
router.get("/ar/public/:id", getOrderById_ar);
router.get("/fr/public/:id", getOrderById_fr);

module.exports = router;