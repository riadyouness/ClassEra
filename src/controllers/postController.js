const db = require("../db");
const path = require("path");
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});


const saveImage = async (image, filename) => {
  console.log("image.length:: " + image.length)
  let filename_core1 = filename.replace('.webp', '')
  let filename_core = filename_core1.replace('posts/images/', '');
  let filname_path = filename_core + '.webp'

  if (image.length > 240) {
    console.log("image.length:: " + image.length)

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const savePath = path.join('./public/images/posts', filname_path);
    fs.writeFile(savePath, buffer, (err) => {
      console.log('path', err, savePath)

    });

    try {
   
      const uploadResponse = await cloudinary.uploader.upload(image, {
        public_id: filename_core,
        overwrite: true,
        invalidate: true,
        format: 'webp',
        timestamp: Math.floor(Date.now() / 1000)
      });
      console.log('finalImageUrl')

      console.log(uploadResponse);
      finalImageUrl = `${uploadResponse.public_id}`;
      console.log(finalImageUrl)
      console.log('finalImageUrl')

    } catch (error) {
      console.log(error)
    }


  }
}

function generateID() {
  return Date.now().toString() + Math.floor(Math.random() * 1000).toString();

}
function getSlug(text) {
  const date = new Date();
  const formattedDate = date.toISOString().split('T')[0];
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 50);
  return `${slug}-${formattedDate}`;
}




// 🟢 Get all posts
exports.getPosts = (req, res) => {
  db.query("SELECT id, title, slug, title_ar, subtitle, image, image_type, created_at, status FROM posts ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};


// 🟢 Get all posts
exports.getPostsByPage = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 8;
  const offset = (page - 1) * limit;

  // 1. Get total number of posts
  db.query("SELECT COUNT(*) AS total FROM posts WHERE status = 'public'", (err, countResult) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }

    const total = countResult[0].total;

    // 2. Get posts for current page
    db.query(
      "SELECT  id, slug, title, subtitle,title_ar, subtitle_ar, title_fr, subtitle_fr, image, image_type  FROM posts WHERE status = 'public' ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [limit, offset],
      (err, posts) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Server error' });
        }

        res.json({ posts, total });
      }
    );
  });
};




// 🟢 Get Latest posts
exports.getLatestPosts = (req, res) => {
  const sqlV = `
  SELECT id, slug, title, subtitle,title_ar, subtitle_ar, title_fr, subtitle_fr, image, image_type FROM posts
  WHERE status = 'public' AND image_type = 'v'
  ORDER BY created_at DESC
  LIMIT 4
`;

  const sqlH = `
  SELECT id, slug, title, subtitle,title_ar, subtitle_ar, title_fr, subtitle_fr, image, image_type FROM posts
  WHERE status = 'public' AND image_type = 'h'
  ORDER BY created_at DESC
  LIMIT 4
`;

  db.query(sqlV, (err, vPosts) => {
    if (err) return res.status(500).json({ error: err });

    db.query(sqlH, (err, hPosts) => {
      if (err) return res.status(500).json({ error: err });

      // build alternating sequence
      const result = [];
      for (let i = 0; i < 4; i++) {

        if (vPosts[i]) result.push(vPosts[i]); // v
        if (hPosts[i]) result.push(hPosts[i]); // h
      }

      res.json(result); // returns VH VH VH VH
    });
  });

};

exports.getPostById = (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM posts WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0)
      return res.status(404).json({ message: "Post not found" });
    res.json(results[0]);
  });
};

// 🟢 Get single post
exports.getPostById_en = (req, res) => {
  const { id } = req.params;
  db.query("SELECT title, subtitle, content, image, created_at FROM posts WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0)
      return res.status(404).json({ message: "Post not found" });
    res.json(results[0]);
  });
};


exports.getPostById_ar = (req, res) => {
  const { id } = req.params;
  db.query("SELECT title_ar as title,subtitle_ar as subtitle,  content_ar as content, image, created_at FROM posts WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0)
      return res.status(404).json({ message: "Post not found" });
    res.json(results[0]);
  });
};
exports.getPostById_fr = (req, res) => {
  const { id } = req.params;
  db.query("SELECT title_fr as title,subtitle_fr as subtitle,  content_fr as content, image, created_at FROM posts WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0)
      return res.status(404).json({ message: "Post not found" });
    res.json(results[0]);
  });
};



exports.getPostBySlug = (req, res) => {
  const { slug } = req.params;
  db.query(
    ` 
      SELECT 
        p.id,
        p.user_id,
        u.fullname,
        p.title,
        p.subtitle,
        p.content,
        p.image,
        p.created_at,
        p.updated_at
      FROM posts p
      LEFT JOIN users u 
        ON p.user_id = u.id
      WHERE p.slug = ?;
    `
    , [slug], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (results.length === 0)
        return res.status(404).json({ message: "Post not found" });
      res.json(results[0]);
    });
};


exports.getPostBySlug_fr = (req, res) => {
  const { slug } = req.params;
  db.query(
    ` 
      SELECT 
        p.id,
        p.user_id,
        u.fullname,
        p.title_fr as title,
        p.subtitle_fr as  subtitle,
        p.content_fr as content,
        p.image,
        p.created_at,
        p.updated_at

      FROM posts p
      LEFT JOIN users u 
        ON p.user_id = u.id
      WHERE p.slug = ?;
    `
    , [slug], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (results.length === 0)
        return res.status(404).json({ message: "Post not found" });
      res.json(results[0]);
    });
};



exports.getPostBySlug_ar = (req, res) => {
  const { slug } = req.params;
  db.query(
    ` 
      SELECT 
        p.id,
        p.user_id,
        u.fullname,
        p.title_ar as title,
        p.subtitle_ar as  subtitle,
        p.content_ar as content,
        p.image,
        p.created_at,
        p.updated_at
      FROM posts p
      LEFT JOIN users u 
        ON p.user_id = u.id
      WHERE p.slug = ?;
    `
    , [slug], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (results.length === 0)
        return res.status(404).json({ message: "Post not found" });
      res.json(results[0]);
    });
};


// 🟡 Create post
exports.createPost = (req, res) => {
  const { title, user_id, subtitle, content, title_fr, subtitle_fr, content_fr, title_ar, subtitle_ar, content_ar, image, image_type, status } = req.body;
  console.log('user_id' + user_id)
  const created_at = new Date();
  let filename = getSlug(title) + '.webp'
  let slug = getSlug(title)

  saveImage(image, filename)

  db.query(
    "INSERT INTO posts (title, user_id, slug, subtitle, content, title_ar, subtitle_ar, content_ar, title_fr, subtitle_fr, content_fr, created_at, updated_at, image, image_type, status) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?,?,?)",
    [title, user_id, slug, subtitle, content, title_ar, subtitle_ar, content_ar, title_fr, subtitle_fr, content_fr, created_at, created_at, '/images/posts/' + filename, image_type, status],
    (err, result) => {
      if (err) {
        console.log(err)
        return res.status(500).json({ error: err });
      }
      res.json({ id: result.insertId, title, created_at });
    }
  );
};

// 🟠 Update post
exports.updatePost = (req, res) => {
  const { id } = req.params;
  const {
    title, user_id, subtitle, content,
    title_fr, subtitle_fr, content_fr,
    title_ar, subtitle_ar, content_ar,
    image, image_type, status, slug
  } = req.body;
  console.log('user id uploud post', user_id)

  const updated_at = new Date();

  let finalname = slug + '.webp'
  let filename = '/images/posts/' + slug + '.webp';

  // if new image is sent (base64) → replace file
  if (image && image.startsWith('data:image')) {
    saveImage(image, finalname)
  }

  // build SQL dynamically (keep old image if no new one)
  let sql = `
  UPDATE posts SET
    title = ?,
    user_id= ?,
    slug = ?,
    subtitle = ?,
    content = ?,
    title_ar = ?,
    subtitle_ar = ?,
    content_ar = ?,
    title_fr = ?,
    subtitle_fr = ?,
    content_fr = ?,
    image_type = ?,
    status = ?,
    updated_at = ?
`;

  let values = [
    title, user_id, slug, subtitle, content,
    title_ar, subtitle_ar, content_ar,
    title_fr, subtitle_fr, content_fr,
    image_type, status, updated_at
  ];

  if (filename) {
    sql += `, image = ?`;
    values.push(filename);
  }

  sql += ` WHERE id = ?`;
  values.push(id);

  db.query(sql, values, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: err });
    }

    res.json({
      id,
      title,
      updated_at
    });
  });

};



// DELETE /deleteWhatsApp/:id
exports.deletePost = (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM posts  WHERE id = ?`;

  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });

    res.status(200).json({ success: true, message: "Config soft-deleted" });
  });
};

