const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const http = require("http");
const os = require("os");

require("dotenv").config();

const app = express();
app.use(express.json({ limit: "50mb" }));

app.use(cors());
app.use(express.json());


app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));


function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

const IP = getLocalIP();
const PORT = 5000;

// API ROUTES
app.use("/api/products", require("./src/routes/products"));
app.use("/api/ar/products", require("./src/routes/products_ar"));
app.use("/api/fr/products", require("./src/routes/products_fr"));

app.use("/api/posts", require("./src/routes/posts"));
app.use("/api/categories", require("./src/routes/categories"));
app.use("/api/checkout", require("./src/routes/checkout"));
app.use("/auth", require("./src/routes/auth"));
app.use("/api/blacklist", require("./src/routes/blacklist"));
app.use("/api/reviews", require("./src/routes/reviews"));
app.use("/api/faqs", require("./src/routes/faqs"));
app.use("/api/announcements", require("./src/routes/announcements"));
app.use("/api/whatsapp", require("./src/routes/whatsapp"));
app.use("/api/contacts", require("./src/routes/contacts"));


app.use("/admin", require("./src/routes/admin"));

// HTML PAGES
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/orders", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/orders.html"));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});


app.get("/categories", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/categories.html"));
});


app.get("/products", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/products/products.html"));
});

app.get("/products/create", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/products/createProduct.html"));
});

app.get("/products/update/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/products/updateProduct.html"));
});


app.get("/users", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/users.html"));
});


app.get("/posts", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/posts/posts.html"));
});

app.get("/posts/create", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/posts/createPost.html"));
});

app.get("/posts/update/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/posts/updatePost.html"));
});


app.get("/checkout", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/checkout.html"));
});
app.get("/blacklist", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/blacklist.html"));
});
app.get("/subscriber", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/subscriber.html"));
});
app.get("/faq", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/faq.html"));
});

app.get("/announces", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/announcements.html"));
});

app.get("/reviews", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/reviews.html"));
});

app.get("/whatsapp", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/whatsapp.html"));
});


app.get("/contacts", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/contacts.html"));
});


http.createServer(app).listen(PORT, () => {
  console.log(`HTTP Server running: http://${IP}:${PORT}`);
});
/*
// خادم HTTP لإعادة التوجيه إلى HTTPS
http.createServer((req, res) => {
  res.writeHead(301, {
    Location: "https://" + req.headers.host.replace(/:\d+$/, ":" + PORT) + req.url
  });
  res.end();
}).listen(80, () => console.log(`🚀 Server running on port 80` , IP+':'+80));

*/
