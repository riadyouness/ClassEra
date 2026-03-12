const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const fs = require('fs');

const app = express();
app.use(express.json({ limit: '50mb' }));

app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "public")));

const key = fs.readFileSync(path.join(__dirname, 'cert/key.pem'))
const cert = fs.readFileSync(path.join(__dirname, 'cert/cert.pem'))
const httpsServer = https.createServer({ key, cert }, app);


// ✅ Routes
app.use("/api/products", require("./src/routes/products"));
app.use("/api/posts", require("./src/routes/posts"));
app.use("/api/categories", require("./src/routes/categories"));

app.use("/api/users", require("./src/routes/users"));
app.use("/api/checkout", require("./src/routes/checkout"));

app.use("/api/login", require("./src/routes/auth"));
app.use("/api/blacklist", require("./src/routes/blacklist"));

app.use("/admin", require("./src/routes/admin"));


// HTML Pages

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/orders", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages/orders.html"));
});


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/products", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages/products.html"));
});
app.get("/products/create", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages/createProduct.html"));
});


app.get("/users", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages/users/users.html"));
});
app.get("/users/create", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages/users/createUser.html"));
});



app.get("/posts", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages/posts/posts.html"));
});

app.get("/posts/create", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages/posts/createPost.html"));
});

app.get("/blacklist", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages/blacklist.html"));
});



const os = require("os");

function getLocalIP() {
  const interfaces = os.networkInterfaces();

  for (const name in interfaces) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;   // return first non-internal IPv4
      }
    }
  }
}

const IP= getLocalIP()
console.log(IP)
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}` , IP+':5000'));