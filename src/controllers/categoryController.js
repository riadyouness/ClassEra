const db = require("../db");
const path = require("path");
const fs = require('fs');

function generateID() {
  return Date.now().toString() + Math.floor(Math.random() * 1000).toString();

}


/* ===================== READ ALL ===================== */
exports.getCategories = (req, res) => {
  const sql = `SELECT id_category, slug, name, name_ar, name_fr, content, content_ar, content_fr, image ,date_category FROM categories ORDER BY date_category DESC`;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};




exports.getCategoriesProduct = (req, res) => {
  const sql = `
  (
    SELECT 
      c.id_category,
      c.slug,
      c.name,
      c.image,
      c.date_category,
      COUNT(p.id) AS product_count
    FROM categories c
    LEFT JOIN products p ON p.category = c.id_category
    WHERE c.slug != 'accessories'
    GROUP BY c.id_category, c.slug, c.name, c.image, c.date_category
    ORDER BY product_count DESC
  )
  UNION ALL
  (
    SELECT 
      c.id_category,
      c.slug,
      c.name,
      c.image,
      c.date_category,
      COUNT(p.id) AS product_count
    FROM categories c
    LEFT JOIN products p ON p.category = c.id_category
    WHERE c.slug = 'accessories'
    GROUP BY c.id_category, c.slug, c.name, c.image, c.date_category
    LIMIT 1
  );
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};
exports.getCategoriesProduct_fr = (req, res) => {
  const sql = `
  (
    SELECT 
      c.id_category,
      c.slug,
      c.name,
      c.name_fr,
      c.image,
      c.date_category,
      COUNT(p.id) AS product_count
    FROM categories c
    LEFT JOIN products p ON p.category = c.id_category
    WHERE c.slug != 'accessories'
    GROUP BY c.id_category, c.slug, c.name, c.name_fr, c.image, c.date_category
    ORDER BY product_count DESC
  )
  UNION ALL
  (
    SELECT 
      c.id_category,
      c.slug,
      c.name,
      c.name_fr,
      c.image,
      c.date_category,
      COUNT(p.id) AS product_count
    FROM categories c
    LEFT JOIN products p ON p.category = c.id_category
    WHERE c.slug = 'accessories'
    GROUP BY c.id_category, c.slug, c.name, c.name_fr, c.image, c.date_category
    LIMIT 1
  );
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};



exports.getCategoriesProduct_ar = (req, res) => {
  const sql = `
  (
    SELECT 
      c.id_category,
      c.slug,
      c.name,
      c.name_ar,
      c.image,
      c.date_category,
      COUNT(p.id) AS product_count
    FROM categories c
    LEFT JOIN products p ON p.category = c.id_category
    WHERE c.slug != 'accessories'
    GROUP BY c.id_category, c.slug, c.name, c.name_ar, c.image, c.date_category
    ORDER BY product_count DESC
  )
  UNION ALL
  (
    SELECT 
      c.id_category,
      c.slug,
      c.name,
      c.name_ar,
      c.image,
      c.date_category,
      COUNT(p.id) AS product_count
    FROM categories c
    LEFT JOIN products p ON p.category = c.id_category
    WHERE c.slug = 'accessories'
    GROUP BY c.id_category, c.slug, c.name, c.name_ar, c.image, c.date_category
    LIMIT 1
  );
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

/* ===================== READ ONE (BY SLUG) ===================== */
exports.getCategorieBySlug = (req, res) => {
  const sql = `
  
  SELECT 
  c.id_category,
  c.slug as category_slug,
  c.name as category,
  c.content,
  c.image AS category_image,
  c.date_category,
  p.id AS id,
  p.name AS name,
  p.slug AS slug,
  p.price,
  p.discount,
  p.size,
  p.color,
  p.sold,
  p.stock,
  p.image AS image
FROM categories c
LEFT JOIN products p
  ON p.category = c.id_category
WHERE c.slug = ?;
  
  `;

  db.query(sql, [req.params.slug], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) return res.status(404).json({ message: 'Not found' });

    const category_name = results[0].category;
    const category_content = results[0].content;
    const category_image = results[0].category_image;

    res.json({
      products: results.map(r => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        price: r.price,
        discount: r.discount,
        size: r.size,
        color: r.color,
        image: r.image,
        sold: r.sold,
        stock: r.stock
      })),
      name: category_name,
      content: category_content,
      image: category_image
    });
  });

};


/* ===================== READ ONE (BY SLUG) ===================== */
exports.getCategorieBySlug_fr = (req, res) => {
  const sql = `
  SELECT 
  c.id_category,
  c.slug AS category_slug,
  c.name_fr AS category,
  c.content_fr AS content,
  c.image AS category_image,
  c.date_category,
  p.id AS id,
  p.name AS name,
  p_fr.name_fr AS name_fr,
  p.slug AS slug,
  p.price,
  p.discount,
  p.size,
  p_fr.color_fr AS color,
  p.sold,
  p.stock,
  p.image AS image
FROM categories c
LEFT JOIN products p
  ON p.category = c.id_category
LEFT JOIN product_fr p_fr
  ON p_fr.id_product = p.id
WHERE c.slug = ?;
  
  `;

  db.query(sql, [req.params.slug], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) return res.status(404).json({ message: 'Not found' });

    const category_name = results[0].category;
    const category_content = results[0].content;
    const category_image = results[0].category_image;

    res.json({
      products: results.map(r => ({
        id: r.id,
        name: r.name,
        name_fr: r.name_fr,
        slug: r.slug,
        price: r.price,
        discount: r.discount,
        size: r.size,
        color: r.color,
        image: r.image,
        sold: r.sold,
        stock: r.stock
      })),
      name: category_name,
      content: category_content,
      image: category_image
    });
  });

};

/* ===================== READ ONE (BY SLUG) ===================== */
exports.getCategorieBySlug_ar = (req, res) => {
  console.log('getCategorieBySlug_ar')
  const sql = `
  SELECT 
  c.id_category,
  c.slug AS category_slug,
  c.name_ar AS category,
  c.content_ar AS content,
  c.image AS category_image,
  c.date_category,
  p.id AS id,
  p.name AS name,
  p_ar.name_ar AS name_ar,
  p.slug AS slug,
  p.price,
  p.discount,
  p.size,
  p_ar.color_ar AS color,
  p.sold,
  p.stock,
  p.image AS image
FROM categories c
LEFT JOIN products p
  ON p.category = c.id_category
LEFT JOIN product_ar p_ar
  ON p_ar.id_product = p.id
WHERE c.slug = ?;
  
  `;

  db.query(sql, [req.params.slug], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) return res.status(404).json({ message: 'Not found' });

    const category_name = results[0].category;
    const category_content = results[0].content;
    const category_image = results[0].category_image;

    res.json({
      products: results.map(r => ({
        id: r.id,
        name: r.name,
        name_ar: r.name_ar,
        slug: r.slug,
        price: r.price,
        discount: r.discount,
        size: r.size,
        color: r.color,
        image: r.image,
        sold: r.sold,
        stock: r.stock
      })),
      name: category_name,
      content: category_content,
      image: category_image
    });
  });

};


/* ===================== READ ALL PRODUCTS IN SAME CATEGORY BY PRODUCT SLUG ===================== */
exports.getCategorieByProductSlug = (req, res) => {
  const sql = `
    SELECT 
      c.id_category,
      c.slug AS category_slug,
      c.name AS category,
      c.content,
      c.image AS category_image,
      c.date_category,
      p.id AS id,
      p.name AS name,
      p.slug AS slug,
      p.price,
      p.discount,
      p.size,
      p.color,
      p.sold,
      p.stock,
      p.image AS image
    FROM categories c
    INNER JOIN products p ON p.category = c.id_category
    WHERE c.id_category = (
        SELECT category FROM products WHERE slug = ?
    )
    AND p.slug != ?     
    ORDER BY RAND()       
    LIMIT 5;
  `;

  db.query(sql, [req.params.slug,req.params.slug], (err, results) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No products found for this category' });
    }

    const category_name = results[0].category;
    const category_content = results[0].content;
    const category_image = results[0].category_image;
    const category_slug = results[0].category_slug;

    res.json({
      category: {
        name: category_name,
        slug: category_slug,
        content: category_content,
        image: category_image
      },
      products: results.map(r => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        price: r.price,
        discount: r.discount,
        size: r.size,
        color: r.color,
        image: r.image,
        sold: r.sold,
        stock: r.stock
      }))
    });
  });
};

/* ===================== READ ONE (BY SLUG) ===================== */
exports.getCategorieByProductSlug_fr = (req, res) => {
  const sql = `
    SELECT 
      c.id_category,
      c.slug AS category_slug,
      c.name_fr AS category,
      c.content,
      c.image AS category_image,
      c.date_category,
      p.id AS id,
      p.name AS name,
      p_fr.name_fr AS name_fr,
      p.slug AS slug,
      p.price,
      p.discount,
      p.size,
      p_fr.color_fr AS color,
      p.sold,
      p.stock,
      p.image AS image
    FROM categories c
    INNER JOIN products p ON p.category = c.id_category
    LEFT JOIN product_fr p_fr ON p_fr.id_product = p.id
    WHERE c.id_category = (
        SELECT category FROM products WHERE slug = ?
    )
    AND p.slug != ?     
    ORDER BY RAND()       
    LIMIT 5;
  `;

  db.query(sql, [req.params.slug,req.params.slug], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "خطأ في قاعدة البيانات" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'لم يتم العثور على منتجات لهذه الفئة' });
    }

    const categoryData = {
      name: results[0].category,
      slug: results[0].category_slug,
      content: results[0].content,
      image: results[0].category_image
    };

    const products = results.map(r => ({
      id: r.id,
      name: r.name,
      name_fr: r.name_fr,
      slug: r.slug,
      price: r.price,
      discount: r.discount,
      size: r.size,
      color: r.color,
      image: r.image,
      sold: r.sold,
      stock: r.stock
    }));

    res.json({
      category: categoryData,
      products: products
    });
  });
};


/* ===================== READ ONE (BY SLUG) ===================== */
exports.getCategorieByProductSlug_ar = (req, res) => {
  const sql = `
    SELECT 
      c.id_category,
      c.slug AS category_slug,
      c.name_ar AS category,
      c.content,
      c.image AS category_image,
      c.date_category,
      p.id AS id,
      p.name AS name,
      p_ar.name_ar AS name_ar,
      p.slug AS slug,
      p.price,
      p.discount,
      p.size,
      p_ar.color_ar AS color,
      p.sold,
      p.stock,
      p.image AS image
    FROM categories c
    INNER JOIN products p ON p.category = c.id_category
    LEFT JOIN product_ar p_ar ON p_ar.id_product = p.id
    WHERE c.id_category = (
        SELECT category FROM products WHERE slug = ?
    )
    AND p.slug != ?     
    ORDER BY RAND()       
    LIMIT 5;
  `;

  db.query(sql, [req.params.slug,req.params.slug], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "خطأ في قاعدة البيانات" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'لم يتم العثور على منتجات لهذه الفئة' });
    }

    const categoryData = {
      name: results[0].category,
      slug: results[0].category_slug,
      content: results[0].content,
      image: results[0].category_image
    };

    const products = results.map(r => ({
      id: r.id,
      name: r.name,
      name_ar: r.name_ar,
      slug: r.slug,
      price: r.price,
      discount: r.discount,
      size: r.size,
      color: r.color,
      image: r.image,
      sold: r.sold,
      stock: r.stock
    }));

    res.json({
      category: categoryData,
      products: products
    });
  });
};


/* ===================== Insert ONE  ===================== */
exports.createPostCategorie = (req, res) => {
  const {
    name, slug,
    name_ar, name_fr,
    content, content_ar, content_fr,
    image
  } = req.body;
  let filename = slug + '.webp'


  if (image.length > 40) {
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const savePath = path.join('./public/images/categories', filename);
    console.log('path', savePath)
    fs.writeFile(savePath, buffer, (err) => {
      console.log(err)
      console.log('save')
    });

    let path_image = "/images/categories/" + filename
    const sql = `
    INSERT INTO categories
    (name, slug, name_ar, name_fr, content, content_ar, content_fr, image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

    db.query(
      sql,
      [name, slug, name_ar, name_fr, content, content_ar, content_fr, path_image],
      (err, results) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Category created', id: results.insertId });
      }
    );

  } else {
    console.log('add image')
    return res.status(500).json(err);
  }

};


/* ===================== UPDATE ===================== */
exports.UpdateCategorie = (req, res) => {
  const { id } = req.params;
  const {
    name,
    slug,
    name_ar,
    name_fr,
    content,
    content_ar,
    content_fr,
    image,
    image_path
  } = req.body;
  let finalname = image_path
  if (!image_path) {
    finalname = '/images/categories/' + slug + generateID() + '.webp';
  }
  console.log(finalname)


  // if new image is sent (base64) → replace file
  if (image && image.startsWith('data:image')) {
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const savePath = path.join('./public', finalname); // same file
    fs.writeFile(savePath, buffer, (err) => {
      console.log(savePath + ' saved')
      if (err) console.log(err);
    });
  }

  const sql = `
      UPDATE categories 
      SET name = ?, slug = ?, name_ar = ?, name_fr = ?,
          content = ?, content_ar = ?, content_fr = ?, image = ?
      WHERE id_category = ?
    `;

  db.query(
    sql,
    [
      name,
      slug,
      name_ar,
      name_fr,
      content,
      content_ar,
      content_fr,
      finalname,
      id
    ],
    (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }
      res.json({ message: 'Category updated, image replaced' });
    }
  );
};


/* ===================== DELETE ===================== */
exports.deleteCategorie = (req, res) => {
  const sql = `DELETE FROM categories WHERE id_category = ?`;

  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Category deleted' });
  });
};
