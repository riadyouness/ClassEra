const db = require("../db");


// ✅ Delete product
exports.adminProducts = (req, res) => {
    const search = req.query.q ? `%${req.query.q}%` : "%%";
    const sql = `
      SELECT id, name, slug, datecreate, stock, price, category, color, size
      FROM products
      WHERE name LIKE ? OR category LIKE ? OR color LIKE ?`;
  
    db.query(sql, [search, search, search, search], (err, results) => {
      if (err) throw err;
      res.json(results);
    });
};



// ✅ Create new product
exports.createProduct = (req, res) => {
  const { name, slug, stock, tags, price } = req.body;
  const sql = `INSERT INTO products (name, slug, stock, tags, price) VALUES (?, ?, ?, ?, ?)`;
  db.query(sql, [name, slug, stock, tags, price], (err, result) => {
    if (err) throw err;
    res.json({ message: "✅ Product created!", id: result.insertId });
  });
};

// ✅ Update product
exports.updateProduct = (req, res) => {
  const { name, slug, stock, tags, price } = req.body;
  const sql = `UPDATE products SET name=?, slug=?, stock=?, tags=?, price=? WHERE id=?`;
  db.query(sql, [name, slug, stock, tags, price, req.params.id], (err) => {
    if (err) throw err;
    res.json({ message: "✅ Product updated!" });
  });
};

exports.deleteProduct00 = (req, res) => {
  db.query("DELETE FROM products WHERE id=?", [req.params.id], (err) => {
    if (err) throw err;
    res.json({ message: "✅ Product deleted!" });
  });
};

const fs = require('fs').promises;
const path = require('path');

exports.deleteProduct = async (req, res) => {
    const productId = req.params.id;

    try {
        // استخدام .promise() لتحويل الاستعلام إلى Promise
        const [imagesRows] = await db.promise().query(
            "SELECT image_1, image_2, image_3, image_4 FROM product_images WHERE id_product=?", 
            [productId]
        );
        const [productRows] = await db.promise().query(
            "SELECT image FROM products WHERE id=?", 
            [productId]
        );

        const allImages = [];
        
        // تجميع كل الصور من جدول الصور الإضافية
        if (imagesRows.length > 0) {
            const row = imagesRows[0];
            if (row.image_1) allImages.push(row.image_1);
            if (row.image_2) allImages.push(row.image_2);
            if (row.image_3) allImages.push(row.image_3);
            if (row.image_4) allImages.push(row.image_4);
        }

        // إضافة الصورة الرئيسية للمنتج
        if (productRows.length > 0 && productRows[0].image) {
            allImages.push(productRows[0].image);
        }

        // حذف الملفات الفعلية من المجلد
        await Promise.all(allImages.map(async (imgName) => {
            const filePath = path.join('./public/images/products', imgName);
            try {
                await fs.unlink(filePath);
            } catch (err) {
                console.warn(`File not found: ${filePath}`);
            }
        }));

        await Promise.all([
            db.promise().query("DELETE FROM reviews WHERE product_id=?", [productId]),
            db.promise().query("DELETE FROM faq WHERE product_id=?", [productId]),
            db.promise().query("DELETE FROM product_images WHERE id_product=?", [productId]),
            db.promise().query("DELETE FROM product_ar WHERE id_product=?", [productId]),
            db.promise().query("DELETE FROM product_fr WHERE id_product=?", [productId])
        ]);

        // الحذف النهائي للمنتج
        await db.promise().query("DELETE FROM products WHERE id=?", [productId]);

        res.json({ message: "✅ Product and its assets deleted successfully!" });

    } catch (err) {
        console.error("Critical Delete Error:", err);
        res.status(500).json({ error: "Technical error during deletion" });
    }
};

exports.adminOrders = (req, res) => {
  const search = req.query.q ? `%${req.query.q}%` : "%%";

  let sql = `
      SELECT 
          c.id AS checkout_id,
          c.full_name,
          c.address,
          c.date_created,
          c.status AS status,
          p.name AS product_name,
          cp.product_qnt,
          cp.product_price
      FROM checkout c
      JOIN checkout_products cp ON c.id = cp.checkout_id
      JOIN products p ON cp.product_id = p.id
      WHERE 1 = 1
  `;

  let params = [];

  // ✅ Filter by full_name
  if (search) {
      sql += " AND (c.full_name LIKE ? OR  p.name LIKE ?)";
      params = [search,search];
  }


  db.query(sql, params, (err, results) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Database query error' });
      }

      const data = {};

      results.forEach(row => {
          if (!data[row.checkout_id]) {
              data[row.checkout_id] = {
                  checkout_id: row.checkout_id,
                  full_name: row.full_name,
                  address: row.address,
                  status: row.status,
                  date_created: row.date_created,
                  products: []
              };
          }

          data[row.checkout_id].products.push({
              product_name: row.product_name,
              product_qnt: row.product_qnt,
              product_price: row.product_price
          });
      });

      res.json(Object.values(data));
  });
};



















// POST /newsletter
exports.newsletter = (req, res) => {
  try {
    const { email } = req.body;
    const sql = "INSERT INTO newsletter (email) VALUES (?)";
    db.query(sql, [email]);
    res.status(201).json({ message: "Email subscribed successfully" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email already subscribed" });
    }
    res.status(500).json({ message: "Server error" });
  }
};
