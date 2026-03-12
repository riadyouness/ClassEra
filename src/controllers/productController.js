const db = require("../db");
const path = require("path");
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret:  process.env.API_SECRET
});




const saveImage = async (image, filename) => {
  console.log("image.length:: " + image.length)
  if (image.length > 240) {
    console.log("image.length:: " + image.length)

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const savePath = path.join('./public/images/products', filename);
    fs.writeFile(savePath, buffer, (err) => {
      console.log('path', err, savePath)

    });
    let filename_core1 = filename.replace('.webp', '')
    filename_core = filename_core1.replace('products/images/','');
    try {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        public_id: filename_core,
        overwrite: true,
        invalidate: true,
        format: 'webp',
      });
      finalImageUrl = `${uploadResponse.public_id}`;
      console.log(finalImageUrl)

    } catch (error) {
      console.log(error)
    }


  }
}






// ✅ Get all products
exports.getAllProducts = (req, res) => {
  const sql = "SELECT * FROM products ORDER BY id DESC";
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
};

// ✅ Paginated + Filtered search
exports.getPaginatedProducts = (req, res) => {
  const page = parseInt(req.params.page) || 1;
  const limit = 6;
  const offset = (page - 1) * limit;

  const search = req.query.q ? `%${req.query.q}%` : "%%";
  const minPrice = req.query.minPrice ? Number(req.query.minPrice) : 0;
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : 1000000;

  let category = req.query.category;

  const color = req.query.color ? req.query.color : "All";
  const size = req.query.size ? req.query.size : "All";

  let sql = `
      SELECT 
          p.id,
          p.slug,
          p.name,
          p.price,
          p.color,
          p.discount,
          p.size,
          p.image,
          p.category,
          p.sold,
          p.stock
      FROM products p
      WHERE status='public' AND  p.name LIKE ?
          AND (p.price - (p.price * p.discount / 100)) BETWEEN ? AND ?
  `;

  let params = [search, minPrice, maxPrice];

  // Size filter
  if (size && size !== "All") {
    if (size === "Small") sql += " AND p.size <= 20";
    else if (size === "Medium") sql += " AND p.size > 20 AND p.size <= 40";
    else if (size === "Large") sql += " AND p.size > 40";
  }

  // Category filter (French)
  if (category && category > 0) {
    sql += " AND p.category = ?";
    params.push(category);
  }

  // Color filter (French)
  if (color && color !== "All") {
    sql += " AND p.color LIKE ?";
    params.push(color);
  }

  sql += " ORDER BY p.id DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  // Execute main query
  db.query(sql, params, (err, results) => {
    if (err) throw err;

    // Count query
    let countSql = `
          SELECT COUNT(*) AS total
          FROM products p
          WHERE status='public' AND  p.name LIKE ?
              AND (p.price - (p.price * p.discount / 100)) BETWEEN ? AND ?

      `;

    let countParams = [search, minPrice, maxPrice];

    if (size && size !== "All") {
      if (size === "Small") countSql += " AND p.size <= 20";
      if (size === "Medium") countSql += " AND p.size > 20 AND p.size <= 40";
      if (size === "Large") countSql += " AND p.size > 40";
    }

    if (category && category > 0) {
      countSql += " AND p.category LIKE ?";
      countParams.push(category);
    }

    if (color && color !== "All") {
      countSql += " AND p.color LIKE ?";
      countParams.push(color);
    }

    db.query(countSql, countParams, (err2, countRes) => {
      if (err2) throw err2;

      const total = countRes[0].total;
      const totalPages = Math.ceil(total / limit);

      res.json({
        page,
        totalPages,
        perPage: limit,
        totalItems: total,
        products: results
      });
    });
  });
};



// ✅ Get product by 4

exports.getLastProduct = (req, res) => {
  const sql = `SELECT
         id, slug, name, price, color, discount, size, sold, stock, image
      FROM products
      WHERE status='public' AND stock > sold AND size > 0 AND datecreate >= DATE_SUB(CURRENT_DATE(), INTERVAL 9 MONTH)
      ORDER BY id DESC
      LIMIT 6`;
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
};


exports.getLastAllProduct = (req, res) => {
  const sql = `SELECT
         id, slug, name, price, color, discount, size, sold, stock, image
      FROM products
      WHERE status='public' AND stock > sold AND size > 0 AND datecreate >= DATE_SUB(CURRENT_DATE(), INTERVAL 9 MONTH)
      ORDER BY id DESC
      LIMIT 8`;
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
};




exports.getDiscountProduct = (req, res) => {
  const sql = "SELECT * FROM products WHERE status='public'AND size > 0  AND  discount > 4 ORDER BY discount DESC LIMIT 10 ";
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
};





exports.getQualityProduct = (req, res) => {
  const sql = "SELECT * FROM products WHERE status='public' AND size > 0  ORDER BY price DESC LIMIT 10; ";
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
};


// ✅ Get product by ID
exports.getProductById = (req, res) => {
  db.query(
    `
    SELECT
      p.*,
      ar.*,
      fr.*,
      imgs.*
    FROM products p
    LEFT JOIN product_ar ar ON ar.id_product = p.id
    LEFT JOIN product_fr fr ON fr.id_product = p.id
    LEFT JOIN product_images imgs ON imgs.id_product = p.id
    WHERE status='public' AND p.id = ?
    `,
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json(err);
      if (results.length === 0) return res.status(404).json({ message: "Product not found" });

      const product = {
        ...results[0]
      };

      res.json(product);
    }
  );
};

function getNextUpdateDate(dateCreate) {
  let now = new Date();
  let nextUpdate = new Date(dateCreate);
  nextUpdate.setFullYear(now.getFullYear());
  while (nextUpdate < now) {
    nextUpdate.setMonth(nextUpdate.getMonth() + 7);
  }
  return nextUpdate.toISOString().split('T')[0];
}
// ✅ Get product by slug
exports.getProductBySlug = (req, res) => {
  db.query(

    ` 
    SELECT 

    p.id, p.name, p.sku, p.brand, p.slug, p.content, p.price, p.color, p.size,
    p.category, p.image, p.discount,
    p.fit, p.material, p.dimension, p.sold, p.stock, p.datecreate as datecreate, p.datecreate as dateupdate,
    pi.image_1, pi.image_2, pi.image_3,  pi.image_4, video
FROM 
    products AS p
LEFT JOIN 
    product_images AS pi ON p.id = pi.id_product
    WHERE status='public' AND slug = ?
LIMIT 1;
     `,

    [req.params.slug], (err, result) => {
      if (err) throw err;
      if (result.length === 0) return res.status(404).json({ message: "Product not found" });
      let result_product = result[0]
      result_product.dateupdate = getNextUpdateDate(result_product.datecreate)

      res.json(result_product);
    });
};





exports.getCategories = (req, res) => {
  const sql = `
    SELECT category, COUNT(*) AS count
    FROM products
    GROUP BY category
    ORDER BY category
  `;

  db.query(sql, (err, results) => {
    if (err) throw err;

    // Add "All" category with total sum
    const totalProducts = results.reduce((sum, cat) => sum + cat.count, 0);
    const categories = [{ category: "All", count: totalProducts }, ...results];

    res.json(categories);
  });
};



exports.getColors = (req, res) => {
  const sql = `
    SELECT color AS color, COUNT(*) AS count
    FROM products
    GROUP BY color
    ORDER BY color
  `;

  db.query(sql, (err, results) => {
    if (err) throw err;

    // Add "All" category with total sum
    const totalProducts = results.reduce((sum, cat) => sum + cat.count, 0);
    const colors = [{ color: "All", count: totalProducts }, ...results];

    res.json(colors);
  });
};



exports.getSizes = (req, res) => {
  const sql = `
    SELECT 
      CASE
        WHEN size <= 20 THEN 'Small'
        WHEN size > 20 AND size <= 40 THEN 'Medium'
        WHEN size > 40 THEN 'Large'
        ELSE 'Other'
      END AS sizeName,
      COUNT(*) AS count
    FROM products
    GROUP BY sizeName
    ORDER BY sizeName;
  `;

  db.query(sql, (err, results) => {
    if (err) throw err;

    // Add "All" category
    const totalProducts = results.reduce((sum, item) => sum + item.count, 0);
    const sizes = [{ sizeName: "All", count: totalProducts }, ...results];

    res.json(sizes);
  });
};



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

// ------|| PRUDUCT  ADD   ||

exports.createProduct = (req, res) => {
  const {
    sku, brand,
    name, price, discount, content, stock, sold, category, color, size, material, fit, dimension, image, video
  } = req.body;


  let slug = getSlug(name) // + generateID()

  let filename = slug + '.webp'

  saveImage(image, filename);

  db.query(
    "INSERT INTO products (name, sku, brand, slug, content, stock, sold, price, discount, category, color, size, material, fit, dimension, image ,video, status) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [name, sku, brand, slug, content, stock, sold, price, discount, category, color, size, material, fit, dimension, '/images/products/' + filename, video, 'public'],

    (err, result) => {
      if (err) {
        console.log(err)
        return res.status(500).json({ error: err });
      }
      res.status(201).json({
        message: "Product created successfully",
        id_product: result.insertId,
        slug
      });
    }


  );


}


// ------------------------------------------------------
// INSERT Arabic Translation
// ------------------------------------------------------
exports.createProduct_ar = (req, res) => {
  const { id_product, name_ar, content_ar, color_ar, material_ar } = req.body;

  db.query(
    `INSERT INTO product_ar (id_product, name_ar, content_ar, color_ar, material_ar)
   VALUES (?, ?, ?, ?, ?)`,
    [id_product, name_ar, content_ar, color_ar, material_ar],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });

      res.status(201).json({
        message: "Arabic version inserted",
        id_product,
      });
    }
  );
};

exports.createProduct_fr = (req, res) => {
  const { id_product, name_fr, content_fr, color_fr, material_fr } = req.body;

  db.query(
    `INSERT INTO product_fr (id_product, name_fr, content_fr, color_fr, material_fr)
   VALUES (?, ?, ?, ?, ?)`,
    [id_product, name_fr, content_fr, color_fr, material_fr],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });

      res.status(201).json({
        message: "French version inserted",
        id_product,
      });
    }
  );
};





exports.createProductAlbum = (req, res) => {
  const { id_product, slug, image_1, image_2, image_3, image_4 } = req.body;

  let filename_1 = slug + '_1' + '.webp'
  let filename_2 = slug + '_2' + '.webp'
  let filename_3 = slug + '_3' + '.webp'
  let filename_4 = slug + '_4' + '.webp'

  saveImage(image_1, filename_1);
  saveImage(image_2, filename_2);
  saveImage(image_3, filename_3);
  saveImage(image_4, filename_4);



  let url = '/images/products/'
  db.query(
    `INSERT INTO product_images (id_product, image_1, image_2, image_3, image_4 )
         VALUES (?, ?, ?, ?, ?)`,
    [id_product, url + filename_1, url + filename_2, url + filename_3, url + filename_4],
    (err, result) => {
      if (err) {
        console.log(err)
        return res.status(500).json({ error: err });
      }

      res.status(201).json({
        message: "Album of product inserted",
        id_product,
      });
    }

  );


}



// || --------------------- PRODUCT UPDATE ------------------- ||

exports.updateProduct = (req, res) => {
  const { id } = req.params;
  const {
    name, sku, brand, price, discount, content, stock, sold, category, image, slug,
    color, size, material, fit, dimension, video, status
  } = req.body;
  console.log('status:--' + status)


  let finalname = slug+ '.webp'
  let filename = '/images/products/' + slug + '.webp';

  // if new image is sent (base64) → replace file
  if (image && image.startsWith('data:image')) {
    saveImage(image, finalname)
  }




  db.query(
    `UPDATE products 
     SET name = ?, sku = ?, brand = ?,content = ?, stock = ?, sold = ?, price = ?, discount = ?,
         category = ?, color = ?, size = ?, material = ?, fit = ?, dimension = ?,
         image = ?, video = ?, status = ?, slug = ?
     WHERE id = ?`,
    [name, sku, brand, content, stock, sold, price, discount, category, color, size, material, fit, dimension, filename, video, status,slug, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });

      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Product not found" });

      res.status(200).json({
        message: "Product Updated successfully",
        id_product: id,
        slug: slug

      });
    }
  );


}



// ------------------------------------------------------
// UPDATE Arabic Translation
// ------------------------------------------------------
exports.updateProduct_ar = (req, res) => {
  const id_product = req.params.id; // ID من الرابط
  const { name_ar, content_ar, color_ar, material_ar } = req.body;
  db.query(
    `UPDATE product_ar
     SET name_ar = ?, content_ar = ?, color_ar = ?, material_ar = ?
     WHERE id_product = ?`,
    [name_ar, content_ar, color_ar, material_ar, id_product],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Arabic translation not found" });

      res.json({
        message: "Arabic translation updated successfully",
        id_product,
      });
    }
  );
};

// ------------------------------------------------------
// UPDATE Arabic Translation
// ------------------------------------------------------
exports.updateProduct_fr = (req, res) => {
  const id_product = req.params.id;
  const { name_fr, content_fr, color_fr, material_fr } = req.body;

  db.query(
    `UPDATE product_fr
     SET name_fr = ?, content_fr = ?, color_fr = ?, material_fr = ?
     WHERE id_product = ?`,
    [name_fr, content_fr, color_fr, material_fr, id_product],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });

      if (result.affectedRows === 0)
        return res.status(404).json({ message: "French translation not found" });

      res.json({
        message: "French translation updated successfully",
        id_product,
      });
    }
  );
};


exports.updateProductAlbum = (req, res) => {
  const { id_product, slug, image_1, image_2, image_3, image_4 } = req.body;

  let filename_1 = slug + '_1' + '.webp'
  let filename_2 = slug + '_2' + '.webp'
  let filename_3 = slug + '_3' + '.webp'
  let filename_4 = slug + '_4' + '.webp'

  saveImage(image_1, filename_1);
  saveImage(image_2, filename_2);
  saveImage(image_3, filename_3);
  saveImage(image_4, filename_4);


  const url = '/images/products/';

  db.query(
    "DELETE FROM product_images WHERE id_product = ?",
    [id_product],
    (err, result) => {

      db.query(
        `INSERT INTO product_images (id_product, image_1, image_2, image_3, image_4)
         VALUES (?, ?, ?, ?, ?)`,
        [id_product, url + filename_1, url + filename_2, url + filename_3, url + filename_4],
        (err, result) => {
          if (err) {
            console.log(err);
            return res.status(500).json({ error: err });
          }

          res.status(201).json({
            message: "Album of product updated successfully",
            id_product,
          });
        }
      );
    }
  );
};




/// cart


exports.CartProducts = (req, res) => {
  const idsParam = req.query.ids;

  if (!idsParam) {
    return res.status(400).json({ error: "No IDs provided" });
  }

  const ids = idsParam.split(",").map(Number);

  // لو فيه ID غير صالح
  if (ids.some(isNaN)) {
    return res.status(400).json({ error: "Invalid IDs format" });
  }

  const placeholders = ids.map(() => "?").join(",");

  const sql = `
  SELECT 
      p.id, 
      p.name, 
      p_fr.name_fr, 
      p_ar.name_ar, 
      p.slug, 
      p.price, 
      p.discount, 
      p.image
  FROM products p
  LEFT JOIN product_fr p_fr ON p.id = p_fr.id_product
  LEFT JOIN product_ar p_ar ON p.id = p_ar.id_product
  WHERE p.id IN (${placeholders})
  `;

  db.query(sql, ids, (err, result) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Database query error" });
    }

    // نرجع المنتجات كما هي (Array of objects)
    return res.status(200).json(result);
  });
};


