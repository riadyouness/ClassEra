const db = require("../db");


exports.apiGetcontacts = (req, res) => {
  const sql = `SELECT * FROM contacts ORDER BY contact_date DESC`;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });

    res.json(results);
  });
};




exports.apiPostcontact = (req, res) => {
  const { firstName, lastName, phone, email, subject, message } = req.body;
  console.log(firstName, lastName, phone, email, subject, message , "apiPostcontact fields")

  if (!firstName || !lastName || !phone || !email || !subject || !message) {
    return res.status(400).json({ error: "missing fields" });
  }

  const sql = `INSERT INTO contacts (firstName, lastName, phone, email, subject, message)
  VALUES (?, ?, ?, ?, ?, ?)`;
  db.query(sql, [firstName, lastName, phone, email, subject, message], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    res.json({
      success: true,
      message: "Reveiws Add successful"
    });
  });


}


exports.apiDeletecontact = (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM contacts WHERE id = ?`;

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });

    if (results.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "contact not found" });
    }

    res.json({
      success: true,
      message: "contact deleted successfully"
    });
  });
};

