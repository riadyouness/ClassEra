const db = require("../db");



// Get all blacklist entries
exports.getAllBlacklist = (req, res) => {
  const query = 'SELECT * FROM blacklist ORDER BY created_at DESC';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    res.json(results);

  });
};

// Add a new blacklist entry
exports.addToBlacklist = (req, res) => {

  const { phone, email, reason, address } = req.body;
  console.log(req.body)
  if (!phone && !email) {
    return res.status(400).json({ message: "Phone or email is required", 'phone': phone, 'phone': email, 'phone': reason });
  }

  const query = 'INSERT INTO blacklist (phone, email, address, reason) VALUES (?, ?, ?, ?)';
  db.query(query, [phone || null, email || null, address || null, reason || null], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: "Already in blacklist" });
      }
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.status(201).json({ message: "Added to blacklist", id: result.insertId });
  });
};

// Delete blacklist entry by ID
exports.deleteFromBlacklist = (req, res) => {

  const { id } = req.params;

  const query = 'DELETE FROM blacklist WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Not found" });

    res.status(200).json({ message: "Deleted from blacklist" });
  });
};

// Check if phone or email is blacklisted
exports.checkBlacklist = (req, res) => {
  const { slug } = req.params;
  const query = 'SELECT * FROM blacklist WHERE phone = ? OR email = ? OR address = ? LIMIT 1';
  db.query(query, [slug, slug, slug], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    if (results.length === 0) return res.status(200).json({ blacklisted: false });

    res.status(200).json({ blacklisted: true, entry: results[0] });
  });
};



exports.searchBlacklist = (req, res) => {
  const { search } = req.params;
  console.log('search',search)

  if (!search || search.trim() === "") {
    return res.status(400).json({ message: "Slug is required",blacklist:[] });
  }

  // Search using LIKE for partial match
  const sql = `
      SELECT *
      FROM blacklist
      WHERE 
        phone LIKE ? 
        OR email LIKE ? 
        OR address LIKE ?
    `;

  const wildcard = `%${search}%`;

  db.query(sql, [wildcard, wildcard, wildcard], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Database error",
        error: err
      });
    }

    // No result
    if (results.length === 0) {
      return res.status(200).json({
        blacklisted: false
      });
    }

    // One or multiple results
    return res.status(200).json({
      blacklisted: true,
      count: results.length,
      blacklist: results
    });
  });
};



// POST /newsletter
exports.newsletterAll = (req, res) => {

    const query = 'SELECT * FROM newsletter ORDER BY id DESC';
    db.query(query, (err, results) => {
      console.log(err)
      if (err) return res.status(500).json({ message: "Database error", error: err });
      res.json(results);
    });
};

// POST /newsletter
exports.newsletterCreate = (req, res) => {
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


exports.newsletterDeleteById = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM newsletter WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Server error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Email not found" });
    }

    res.json({ message: "Email deleted successfully" });
  });
};



// GET /getWhatsApp
exports.getWhatsApp = (req, res) => {
  let msg = {
    phone: "212600000000",
    text: "Hello, I need more information about your product."
  }
  //const sql = "INSERT INTO newsletter (email) VALUES (?)";
  // db.query(sql, [email]);
  res.status(201).json(
    msg
  );
};











exports.getWhatsApp = (req, res) => {


  const sql = `
    SELECT phone, text_en, text_ar, text_fr
    FROM whatsapp_config
    ORDER BY created_at DESC
    LIMIT 1
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });

    if (results.length === 0) {
      return res.status(404).json({ error: "No active WhatsApp config found" });
    }

    const row = results[0];

    res.status(200).json(row);
  });
};


// POST /addWhatsApp
exports.addWhatsApp = (req, res) => {
  const { phone, text_en, text_ar, text_fr } = req.body;

  const sql = `
    INSERT INTO whatsapp_config (phone, text_en, text_ar, text_fr)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [phone, text_en, text_ar, text_fr], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });

    res.status(201).json({ success: true, message: "WhatsApp config added" });
  });
};


// DELETE /deleteWhatsApp/:id
exports.deleteWhatsApp = (req, res) => {
  const { id } = req.params;

  const sql = `
    UPDATE whatsapp_config
    SET deleted_at = NOW()
    WHERE id = ?
  `;

  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });

    res.status(200).json({ success: true, message: "Config soft-deleted" });
  });
};