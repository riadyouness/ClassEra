const express = require("express");
const router = express.Router();
const {
  getPosts,
  getPostsByPage,
  getLatestPosts,
  getPostBySlug,
  getPostBySlug_fr,
  getPostBySlug_ar,
  createPost,
  updatePost,
  getPostById,
  getPostById_en,
  getPostById_ar, getPostById_fr,
  deletePost
} = require("../controllers/postController");


router.get("/", getPosts);
router.get("/pages", getPostsByPage);
router.get("/last", getLatestPosts);

router.get("/slug/:slug", getPostBySlug);
router.get("/fr/slug/:slug", getPostBySlug_fr);
router.get("/ar/slug/:slug", getPostBySlug_ar);


router.get("/id/:id/", getPostById);
router.get("/:id/en", getPostById_en);
router.get("/:id/ar", getPostById_ar);
router.get("/:id/fr", getPostById_fr);

router.post("/", createPost);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);


module.exports = router;