const express = require("express");
const router = express.Router();
const {
    getAnnouncements,
    getAnnouncementsEn,
    getAnnouncementsFr,
    getAnnouncementsAr,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement
} = require("../controllers/announcementController");
router.get("/", getAnnouncements);
router.post("/", createAnnouncement);
router.put("/:id", updateAnnouncement);
router.delete("/:id", deleteAnnouncement);

router.get("/en", getAnnouncementsEn);
router.get("/ar", getAnnouncementsAr);
router.get("/fr", getAnnouncementsFr);

module.exports = router;