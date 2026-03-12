const express = require("express");
const router = express.Router();
const {
  getLatestUsers,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
 
} = require("../controllers/userController");

router.get("/", getUsers);
router.get("/last", getLatestUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);


module.exports = router;