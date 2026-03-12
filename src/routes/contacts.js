const express = require("express");
const router = express.Router();
const {
    apiGetcontacts,
    apiPostcontact,
    apiDeletecontact,
} = require("../controllers/contactController");


router.get("/", apiGetcontacts);
router.post("/", apiPostcontact);
router.delete("/:id", apiDeletecontact);


module.exports = router;