const db = require("../db");


exports.apiGetReviews = (req, res) => {
  const sql = `SELECT * FROM reviews ORDER BY review_date DESC`;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });

    res.json(results);
  });
};

exports.apiReviewByProductSlug = (req, res) => {
  const { slug } = req.params;
  const sql = `SELECT
    r.id, r.username, r.phone, r.review_text, r.stars, r.review_date,
    p.id AS product_id, p.name AS product_name, p.slug, r.review_date as reviewDate
    FROM reviews r
    JOIN products p ON r.product_id = p.id
    WHERE p.slug = ?
    ORDER BY r.review_date DESC`;


  db.query(sql, [slug], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err });
    results.forEach(r => {
      r.reviewDate = r.reviewDate.toISOString().split('T')[0];
    });
    res.json(results);
  });

};

exports.apiGetReviewsById = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT * FROM reviews 
    WHERE id = ?
    ORDER BY review_date DESC
  `;

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });

    res.json(results);
  });
};

exports.apiPostReview = (req, res) => {
  const { username, phone, product_id, review_text, stars } = req.body;
  console.log(stars, "apiPostReview fields")

  if (!username || !product_id || !review_text || !stars) {
    return res.status(400).json({ error: "missing fields" });
  }

  const sql = `INSERT INTO reviews (username, phone, product_id, review_text, stars)
  VALUES (?, ?, ?, ?, ?)`;
  db.query(sql, [username, phone, product_id, review_text, stars], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    res.json({
      success: true,
      message: "Reveiws Add successful"
    });
  });


}

exports.apiUpdateReview = (req, res) => {
  const { id } = req.params;
  const { username, phone, review_text, stars } = req.body;

  const sql = `
    UPDATE reviews
    SET username = ?, phone = ?, review_text = ?, stars = ?
    WHERE id = ?
  `;

  db.query(sql, [username, phone, review_text, stars, id], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });

    if (results.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    res.json({
      success: true,
      message: "Review updated successfully"
    });
  });
};

exports.apiDeleteReview = (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM reviews WHERE id = ?`;

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });

    if (results.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    res.json({
      success: true,
      message: "Review deleted successfully"
    });
  });
};

