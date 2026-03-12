const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const mysqldump = require('mysqldump');
const path = require("path");
const fs = require("fs");


/* ===================== TOKEN ===================== */
function generateToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "60m", issuer: "eravist-api" }
  );
}

/* ===================== AUTH MIDDLEWARE ===================== */
exports.auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.sendStatus(401);

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    req.user = decoded;
    next();
  });
};

/* ===================== LOGIN ===================== */
exports.apiLogin = (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ? LIMIT 1",
    [email],
    (err, results) => {
      if (err) return res.sendStatus(500);
      if (!results.length) return res.sendStatus(401);

      const user = results[0];

      bcrypt.compare(password, user.password, (err, match) => {
        if (err) return res.sendStatus(500);
        if (!match) return res.sendStatus(401);

        res.json({
          success: true,
          token: generateToken(user)
        });
      });
    }
  );
};

/* ===================== USERS ===================== */
exports.getUsers = (req, res) => {
  db.query(
    "SELECT id, fullname, email, role FROM users ORDER BY id DESC",
    (err, results) => {
      if (err) return res.sendStatus(500);
      res.json(results);
    }
  );
};

/* ===================== CREATE USER ===================== */
exports.createUser = async (req, res) => {
  const { fullname, email, password } = req.body;
  console.log(fullname, email, password)
  if (!password) return res.status(400).json({ message: "Password required" });

  const hashed = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (fullname, email, password, role) VALUES (?, ?, ?, 'USER')",
    [fullname, email, hashed],
    (err, result) => {
      if (err) return res.sendStatus(500);
      res.status(201).json({ id: result.insertId });
    }
  );
};

/* ===================== UPDATE USER ===================== */
exports.updateUser = (req, res) => {
  const { id } = req.params;
  const { fullname, email, role } = req.body;

  db.query(
    "UPDATE users SET fullname = ?, email = ?, role = ? WHERE id = ?",
    [fullname, email, role, id],
    (err) => {
      if (err) return res.sendStatus(500);
      res.json({ success: true });
    }
  );
};

/* ===================== DELETE USER ===================== */
exports.deleteUser = (req, res) => {
  const { id } = req.params;

  db.query(
    "DELETE FROM users WHERE id = ?",
    [id],
    (err) => {
      if (err) return res.sendStatus(500);
      res.json({ success: true });
    }
  );
};


exports.apiCheckToken = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ valid: false, message: "No token provided" });

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ valid: false, message: "Invalid or expired token" });

    // Optionally, return user info from token
    res.json({ valid: true, user: decoded });
  });
};



exports.getExportMyData = async (req, res) => {

  try {
    const filePath = path.join(__dirname, 'backup.sql');
    console.log(filePath)
    await mysqldump({
      connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        charset: 'utf8mb4'
      },
      dumpToFile: filePath,
    });

    if (fs.existsSync(filePath)) {
      res.download(filePath, 'backup.sql', (err) => {
        if (err) {
          console.error('Error during download:', err);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

          if (!res.headersSent) {
            return res.status(500).send('Error downloading file');
          }
        } else {
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
              console.error('Error deleting file:', unlinkErr);
            } else {
              console.log('File deleted successfully after download.');
            }
          });
        }
      });
    } else {
      res.status(500).send('File not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error exporting SQL file');
  }

};