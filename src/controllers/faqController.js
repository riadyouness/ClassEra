const db = require("../db");


/* ================================================
   GET ALL FAQ
================================================ */
exports.apiGetFaq = (req, res) => {
    const sql = `SELECT * FROM faq ORDER BY created_at DESC`;
  
    db.query(sql, (err, results) => {
      if (err)
        return res.status(500).json({ success: false, message: "Database error" });
  
      res.json(results);
    });
  };
  
  /* ================================================
     GET FAQ BY PRODUCT SLUG
  ================================================ */
  exports.apiFaqByProductEnSlug = (req, res) => {
    const { slug } = req.params;
  
    const sql = `
      SELECT 
        f.id, f.question, f.answer, f.language, f.created_at,
        p.id AS product_id, p.name AS product_name, p.slug  
      FROM faq f
      JOIN products p ON f.product_id = p.id
      WHERE p.slug = ? AND f.language = "en"
      ORDER BY f.created_at DESC
    `;
  
    db.query(sql, [slug], (err, results) => {
      if (err)
        return res.status(500).json({ success: false, message: "Database error" });
  
      res.json(results);
    });
  };
  
  exports.apiFaqByProductArSlug = (req, res) => {
    const { slug } = req.params;
  
    const sql = `
      SELECT 
        f.id, f.question, f.answer, f.language, f.created_at,
        p.id AS product_id, p.name AS product_name, p.slug  
      FROM faq f
      JOIN products p ON f.product_id = p.id
      WHERE p.slug = ? AND f.language = "ar"
      ORDER BY f.created_at DESC
    `;
  
    db.query(sql, [slug], (err, results) => {
      if (err)
        return res.status(500).json({ success: false, message: "Database error" });
  
      res.json(results);
    });
  };
  
  exports.apiFaqByProductFrSlug = (req, res) => {
    const { slug } = req.params;
  
    const sql = `
      SELECT 
        f.id, f.question, f.answer, f.language, f.created_at,
        p.id AS product_id, p.name AS product_name, p.slug  
      FROM faq f
      JOIN products p ON f.product_id = p.id
      WHERE p.slug = ? AND f.language = "fr"
      ORDER BY f.created_at DESC
    `;
  
    db.query(sql, [slug], (err, results) => {
      if (err)
        return res.status(500).json({ success: false, message: "Database error" });
  
      res.json(results);
    });
  };
  
  /* ================================================
     GET FAQ BY ID
  ================================================ */
  exports.apiGetFaqById = (req, res) => {
    const { id } = req.params;
  
    const sql = `
      SELECT * FROM faq
      WHERE id = ?
      ORDER BY created_at DESC
    `;
  
    db.query(sql, [id], (err, results) => {
      if (err)
        return res.status(500).json({ success: false, message: "Database error" });
  
      res.json(results);
    });
  };
  
  /* ================================================
     ADD FAQ
  ================================================ */
  exports.apiAddFaq = (req, res) => {
    const { product_id, question, answer, language } = req.body;
  
    if (!product_id || !question || !answer || !language) {
      return res.status(400).json({ error: "missing fields" });
    }
  
    const sql = `
      INSERT INTO faq (product_id, question, answer, language)
      VALUES (?, ?, ?, ?)
    `;
  
    db.query(sql, [product_id, question, answer, language], (err, results) => {
      if (err)
        return res.status(500).json({ success: false, message: "Database error" });
  
      res.json({
        success: true,
        message: "FAQ added successfully",
        id: results.insertId
      });
    });
  };
  
  /* ================================================
     UPDATE FAQ
  ================================================ */
  exports.apiUpdateFaq = (req, res) => {
    const { id } = req.params;
    const { question, answer, language } = req.body;
  
    const sql = `
      UPDATE faq
      SET question = ?, answer = ?, language = ?
      WHERE id = ?
    `;
  
    db.query(sql, [question, answer, language, id], (err, results) => {
      if (err)
        return res.status(500).json({ success: false, message: "Database error" });
  
      if (results.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "FAQ not found" });
      }
  
      res.json({
        success: true,
        message: "FAQ updated successfully"
      });
    });
  };
  
  /* ================================================
     DELETE FAQ
  ================================================ */
  exports.apiDeleteFaq = (req, res) => {
    const { id } = req.params;
  
    const sql = `DELETE FROM faq WHERE id = ?`;
  
    db.query(sql, [id], (err, results) => {
      if (err)
        return res.status(500).json({ success: false, message: "Database error" });
  
      if (results.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "FAQ not found" });
      }
  
      res.json({
        success: true,
        message: "FAQ deleted successfully"
      });
    });
  };
  