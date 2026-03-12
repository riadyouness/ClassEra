const db = require("../db");


exports.apiGetWhatsapps = (req, res) => {
  const sql = `SELECT * FROM whatsapp_config ORDER BY created_at DESC`;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });

    res.json({
      results
    });
  });
};



exports.apiAddWhatsapps = (req, res) => {
    const {  phone, text_en, text_ar , text_fr  } = req.body;

  if (!phone || !text_en || !text_ar || !text_fr) {
    return res.status(400).json({ error: "missing fields" });
  }

  const sql = `INSERT INTO whatsapp_config (phone, text_en, text_ar, text_fr)
  VALUES (?, ?, ?, ?)`;
  db.query(sql, [phone, text_en, text_ar, text_fr], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid whatsapp_config" });
    }

    // Login success
 
    res.json({
      success: true,
      message: "Whatsapp Config Add successful",
      id: results
    });
  });


}
exports.apiUpdateWhatsapps = (req, res) => {
  const { id } = req.params;
  const {  phone, text_en, text_ar , text_fr  } = req.body;
  if (!phone || !text_en || !text_ar || !text_fr) {
    return res.status(400).json({ error: "missing fields" });
  }

  const sql = `
    UPDATE whatsapp_config
    SET  phone = ?, text_en = ?, text_fr = ? , text_ar = ?
    WHERE id = ?
  `;

  db.query(sql, [phone, text_en, text_fr, text_ar, id], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });

    if (results.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Whatsapp not found" });
    }

    res.json({
      success: true,
      message: "Whatsapp updated successfully"
    });
  });
};

exports.apiDeleteWhatsapps = (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM whatsapp_config WHERE id = ?`;

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });

    if (results.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "whatsapp_config not found" });
    }

    res.json({
      success: true,
      message: "whatsapp_config deleted successfully"
    });
  });
};

