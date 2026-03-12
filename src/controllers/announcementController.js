const db = require("../db");

exports.getAnnouncements = (req, res) => {
  const sql = `
    SELECT id, text, lang
    FROM announcements
     ORDER BY ID DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }
    res.json(results);
  });
};

exports.getAnnouncementsEn = (req, res) => {
  const sql = `
      SELECT id, text, lang
      FROM announcements
      WHERE lang= 'en'
      ORDER BY ID DESC
    `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }
    res.json(results);
  });
};

exports.getAnnouncementsFr = (req, res) => {
  const sql = `
      SELECT id, text, lang
      FROM announcements
      WHERE lang= 'fr'
      ORDER BY ID DESC
    `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }
    res.json(results);
  });
};

exports.getAnnouncementsAr = (req, res) => {
  const sql = `
      SELECT id, text, lang
      FROM announcements
      WHERE lang= 'ar'
      ORDER BY ID DESC
    `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }
    res.json(results);
  });
};



exports.createAnnouncement = (req, res) => {
  const { text, lang } = req.body;
  const sql = `INSERT INTO announcements (text, lang) VALUES (?, ?)`;

  db.query(sql, [text, lang], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.status(201).json({ id: result.insertId, text, lang });
  });
};


exports.updateAnnouncement = (req, res) => {
  const { id } = req.params;
  const { text, lang } = req.body;

  const sql = `UPDATE announcements SET text = ?, lang = ? WHERE id = ?`;

  db.query(sql, [text, lang, id], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Announcement not found" });
    res.json({ id, text, lang });
  });
};


exports.deleteAnnouncement = (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM announcements WHERE id = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Announcement not found" });
    res.json({ message: "Announcement deleted", id });
  });
};
