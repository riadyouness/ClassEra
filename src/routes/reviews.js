const express = require("express");
const router = express.Router();
const {
    apiGetReviews,
    apiGetReviewsById,
    apiReviewByProductSlug,
    apiPostReview,
    apiUpdateReview,
    apiDeleteReview
} = require("../controllers/reviewController");

router.get("/", apiGetReviews);
router.get("/:id", apiGetReviewsById);
router.get("/slug/:slug", apiReviewByProductSlug);
router.post("/", apiPostReview);
router.put("/:id", apiUpdateReview);
router.delete("/:id", apiDeleteReview);

module.exports = router;