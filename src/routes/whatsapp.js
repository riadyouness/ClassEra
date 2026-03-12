const express = require("express");
const router = express.Router();

const {
  apiGetWhatsapps,
  apiAddWhatsapps,
  apiUpdateWhatsapps,
  apiDeleteWhatsapps
} = require("../controllers/whatsappController");

// Get all FAQ
router.get("/", apiGetWhatsapps);
// Get FAQ by ID
router.post("/", apiAddWhatsapps);
// Update FAQ
router.put("/:id", apiUpdateWhatsapps);
// Delete FAQ
router.delete("/:id", apiDeleteWhatsapps);

module.exports = router;