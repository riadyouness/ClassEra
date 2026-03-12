const express = require("express");
const router = express.Router();
const {
    apiLogin,
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    getExportMyData,
    auth,
    apiCheckToken


} = require("../controllers/authController");

router.post("/login", apiLogin);
router.get("/users", auth, getUsers);
router.get("/export",auth, getExportMyData);
router.post("/users", auth, createUser);
router.put("/users/:id", auth, updateUser);
router.delete("/users/:id", auth, deleteUser);
router.get("/",  apiCheckToken);
module.exports = router;