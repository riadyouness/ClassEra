const express = require("express");
const router = express.Router();

const {
  apiGetFaq,
  apiGetFaqById,
  apiFaqByProductEnSlug,
  apiFaqByProductFrSlug,
  apiFaqByProductArSlug,
  apiAddFaq,
  apiUpdateFaq,
  apiDeleteFaq
} = require("../controllers/faqController");

// Get all FAQ
router.get("/", apiGetFaq);
// Get FAQ by ID
router.get("/:id", apiGetFaqById);
// Get FAQ by product slug
router.get("/slug/en/:slug", apiFaqByProductEnSlug);
router.get("/slug/fr/:slug", apiFaqByProductFrSlug);
router.get("/slug/ar/:slug", apiFaqByProductArSlug);

// Add FAQ
router.post("/", apiAddFaq);
// Update FAQ
router.put("/:id", apiUpdateFaq);
// Delete FAQ
router.delete("/:id", apiDeleteFaq);

module.exports = router;