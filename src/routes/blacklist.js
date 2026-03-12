const express = require("express");
const router = express.Router();


const {
    getAllBlacklist,
    addToBlacklist,
    deleteFromBlacklist,
    checkBlacklist,
    searchBlacklist,
    newsletterAll,
    newsletterCreate,
    newsletterDeleteById,
    getWhatsApp,
    addWhatsApp,
    deleteWhatsApp
} = require("../controllers/blacklistController");

router.get('/', getAllBlacklist);
router.get('/search', getAllBlacklist);
router.post('/', addToBlacklist);
router.delete('/id/:id', deleteFromBlacklist);
router.get('/slug/:slug', checkBlacklist);
router.get('/search/:search', searchBlacklist);

router.get("/newsletter", newsletterAll);
router.post("/newsletter", newsletterCreate);
router.delete("/newsletter/:id", newsletterDeleteById);


router.get("/whatsapp", getWhatsApp);
router.post("/whatsapp", addWhatsApp);
router.delete("/whatsapp", deleteWhatsApp)

module.exports = router;