const db = require("../db");



// ✅ Paginated + Filtered search
// ✅ Paginated + Filtered search (French)
exports.getPaginatedProducts_fr = (req, res) => {
    const page = parseInt(req.params.page) || 1;
    const limit = 6;
    const offset = (page - 1) * limit;

    const search = req.query.q ? `%${req.query.q}%` : "%%";
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : 0;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : 1000000;

    let category = req.query.category;

    const color = req.query.color ? req.query.color : "All";
    const size = req.query.size ? req.query.size : "All";

    let sql = `
        SELECT 
        p.id,
        p.slug,
        p.name,
        p_fr.name_fr,
        p.price,
        p.color,
        p_fr.color_fr,
        p.discount,
        p.size,
        p.image,
        p.category,
        p.sold,
        p.stock
    FROM products p
    LEFT JOIN product_fr p_fr 
        ON p.id = p_fr.id_product
    WHERE p.status = 'public' 
        AND (p_fr.name_fr LIKE ?) 
        AND (p.price - (p.price * p.discount / 100)) BETWEEN ? AND ?
        `;

    let params = [search, minPrice, maxPrice];
    // Size filter
    if (size && size !== "All") {
        if (size === "Small") sql += " AND p.size <= 20";
        else if (size === "Medium") sql += " AND p.size > 20 AND p.size <= 40";
        else if (size === "Large") sql += " AND p.size > 40";
    }

    // Category filter (French)
    if (category && category > 0) {
        sql += " AND p.category = ?";
        params.push(category);
    }

    // Color filter (French)
    if (color && color !== "All") {
        sql += " AND p.color LIKE ?";
        params.push(color);
    }

    sql += " ORDER BY p.id DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);
    db.query(sql, params, (err, results) => {
        if (err) throw err;

        // Count query
        let countSql = `
                SELECT COUNT(*) AS total
                FROM products p
                LEFT JOIN product_fr p_fr 
                    ON p.id = p_fr.id_product
                WHERE p.status = 'public'  
                AND  p_fr.name_fr LIKE ?
                    AND (p.price - (p.price * p.discount / 100)) BETWEEN ? AND ?
      
            `;

        let countParams = [search, minPrice, maxPrice];

        if (size && size !== "All") {
            if (size === "Small") countSql += " AND p.size <= 20";
            if (size === "Medium") countSql += " AND p.size > 20 AND p.size <= 40";
            if (size === "Large") countSql += " AND p.size > 40";
        }

        if (category && category > 0) {
            countSql += " AND p.category = ?";
            countParams.push(category);
        }

        if (color && color !== "All") {
            countSql += " AND p.color LIKE ?";
            countParams.push(color);
        }

        db.query(countSql, countParams, (err2, countRes) => {
            if (err2) throw err2;

            const total = countRes[0].total;
            const totalPages = Math.ceil(total / limit);

            res.json({
                page,
                totalPages,
                perPage: limit,
                totalItems: total,
                products: results
            });
        });
    });
};

// ------------------------------------------------------
// LAST 10 PRODUCTS – Arabic
// ------------------------------------------------------
exports.getLastAllProduct_fr = (req, res) => {
    const sql = ` SELECT 
    p.id,
    p.slug,
    p.name,
    p.price,
    p.color,
    p.discount,
    p.size,
    p.image,
    fr.name_fr,
    fr.color_fr,
    fr.category_fr,
    p.sold,
    p.stock
    FROM products p
    LEFT JOIN product_fr fr ON p.id = fr.id_product
    WHERE status='public' AND stock > sold  AND size > 0 AND  datecreate >= DATE_SUB(CURRENT_DATE(), INTERVAL 9 MONTH)

    ORDER BY p.id DESC
    LIMIT 8;
  
  `;
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
};




// ------------------------------------------------------
// LAST PRODUCTS
// ------------------------------------------------------
exports.getLastProduct_fr = (req, res) => {
    const sql = ` SELECT 
    p.id,
    p.slug,
    p.name,
    p.price,
    p.color,
    p.discount,
    p.size,
    p.image,
    p.sold,
    p.stock,
    fr.name_fr,
    fr.color_fr,
    c.name_fr AS category_fr 
  
  FROM products p
  LEFT JOIN product_fr fr ON p.id = fr.id_product
  LEFT JOIN categories c ON p.category = c.id_category -- Jointure pour la catégorie
  WHERE status='public' AND stock > sold AND size > 0 AND  datecreate >= DATE_SUB(CURRENT_DATE(), INTERVAL 9 MONTH)

ORDER BY p.id DESC
LIMIT 5;
  `;
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
};


// ------------------------------------------------------
// LAST PRODUCTS
// ------------------------------------------------------
exports.getArrivalsProduct_fr = (req, res) => {
    const sql = ` SELECT 
    p.id,
    p.slug,
    p.name,
    p.price,
    p.sold,
    p.stock,
    p.color,
    p.discount,
    p.size,
    p.image,
    fr.name_fr,
    fr.color_fr,
    c.name_fr AS category_fr -- Récupéré directement de la table des catégories
  
  FROM products p
  LEFT JOIN product_fr fr ON p.id = fr.id_product
  LEFT JOIN categories c ON p.category = c.id_category 
  WHERE status='public' AND stock > sold AND size > 0  AND datecreate >= DATE_SUB(CURRENT_DATE(), INTERVAL 9 MONTH)

ORDER BY p.id DESC
LIMIT 10;
  `;
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
};






// ------------------------------------------------------
// DISCOUNTED PRODUCTS
// ------------------------------------------------------
exports.getDiscoutProduct_fr = (req, res) => {
    const sql = ` SELECT 
    p.id,
    p.slug,
    p.name,
    p.price,
    p.sold,
    p.stock,
    p.color,
    p.discount,
    p.size,
    p.image,
    fr.name_fr,
    fr.color_fr,
    c.name_fr AS category_fr 
  
  FROM products p
  LEFT JOIN product_fr fr ON p.id = fr.id_product
  LEFT JOIN categories c ON p.category = c.id_category
  
  WHERE p.discount > 0 AND status='public'

  ORDER BY p.discount DESC
  LIMIT 8;
  
  `;
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
};



// ------------------------------------------------------
// PREMIUM PRODUCTS (based on price desc)
// ------------------------------------------------------
exports.getQualityProduct_fr = (req, res) => {
    const sql = ` SELECT
    p.id,
    p.slug,
    p.name,
    p.price,
    p.sold,
    p.stock,
    p.color,
    p.discount,
    p.size,
    p.image,
    fr.name_fr,
    fr.color_fr,
    c.name_fr AS category_fr
  
  FROM products p
  LEFT JOIN product_fr fr ON p.id = fr.id_product
  LEFT JOIN categories c ON p.category = c.id_category -- Jointure pour la catégorie
  
  WHERE p.price > 450 AND size > 0 AND status='public'

  ORDER BY p.price DESC
  LIMIT 8;
  `;
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
};



// ------------------------------------------------------
// PRODUCT BY SLUG
// ------------------------------------------------------
exports.getProductBySlug_fr = (req, res) => {
    const sql = `
   
    
    SELECT 
    p.id, p.name, p.sku, p.brand, p.slug, p.content, p_fr.name_fr, p_fr.content_fr, p.price, p.color, p_fr.color_fr, p.size,
    p.category, p.image, p.datecreate, p.discount,
    p.fit, p.material, p_fr.material_fr, p.dimension, p.sold, p.stock,
    pi.image_1, pi.image_2, pi.image_3,  pi.image_4, video
    
    FROM  products AS p

    LEFT JOIN product_images i ON p.id = i.id_product
    LEFT JOIN product_fr p_fr ON p.id = p_fr.id_product
    LEFT JOIN 
    product_images AS pi ON p.id = pi.id_product
    WHERE status='public' AND slug = ?
    LIMIT 1
  `;


    db.query(sql, [req.params.slug], (err, result) => {
        if (err) throw err;
        if (!result.length) return res.status(404).json({ message: "Produit n'est pas trouve" });
        let result_product = result[0]
        result_product.dateupdate = getNextUpdateDate(result_product.datecreate)
  
        res.json(result_product);
    });
};


function getNextUpdateDate(dateCreate) {
    let now = new Date();
    let nextUpdate = new Date(dateCreate);
    nextUpdate.setFullYear(now.getFullYear());
    while (nextUpdate < now) {
      nextUpdate.setMonth(nextUpdate.getMonth() + 7);
    }
    return nextUpdate.toISOString().split('T')[0];
  }

// ------------------------------------------------------
// CATEGORIES (Arabic)
// ------------------------------------------------------
exports.getCategories_grouped_fr = (req, res) => {
    const sql = `
    SELECT 
      a.category_fr,
      p.category AS category,
      COUNT(*) AS count
    FROM products p
    LEFT JOIN product_fr a ON p.id = a.id_product
    GROUP BY a.category_fr
    ORDER BY a.category_fr
  `;

    db.query(sql, (err, results) => {
        if (err) throw err;

        const total = results.reduce((sum, c) => sum + c.count, 0);

        // Add ALL category
        const categories = [
            { category: "All", category_fr: "Tout", count: total },
            ...results
        ];

        res.json(categories);
    });
};



// ------------------------------------------------------
// COLORS (Arabic)
// ------------------------------------------------------
exports.getColors_fr = (req, res) => {
    const sql = `
    SELECT 
      a.color_fr AS color_fr,
      p.color AS color,
      COUNT(*) AS count
    FROM products p
    LEFT JOIN product_fr a ON p.id = a.id_product
    GROUP BY a.color_fr, p.color 
     ORDER BY count
  `;

    db.query(sql, (err, results) => {
        if (err) throw err;

        const total = results.reduce((sum, c) => sum + c.count, 0);

        const colors = [
            { color: "All", color_fr: "Tout", count: total },
            ...results
        ];

        res.json(colors);
    });
};



// ------------------------------------------------------
// SIZES + Arabic translation
// ------------------------------------------------------
exports.getSizes_fr = (req, res) => {
    const sql = `
    SELECT 
      CASE
        WHEN size <= 20 THEN 'Small'
        WHEN size > 20 AND size <= 40 THEN 'Medium'
        WHEN size > 40 THEN 'Large'
        ELSE 'Other'
      END AS sizeName,
      COUNT(*) AS count
    FROM products
    GROUP BY sizeName
    ORDER BY sizeName
  `;

    db.query(sql, (err, results) => {
        if (err) throw err;

        results.forEach(r => {
            if (r.sizeName === "Large") r.sizeName_fr = "Grande";
            if (r.sizeName === "Medium") r.sizeName_fr = "Moyenne";
            if (r.sizeName === "Small") r.sizeName_fr = "Petite";
            if (r.sizeName === "Other") r.sizeName_fr = "Autre";
        });

        const total = results.reduce((sum, item) => sum + item.count, 0);

        const sizes = [
            { sizeName: "All", sizeName_fr: "Tout", count: total },
            ...results
        ];

        res.json(sizes);
    });
};



// ------------------------------------------------------
// INSERT Arabic Translation
// ------------------------------------------------------
exports.createProduct_fr = (req, res) => {
    const { id_product, name_fr, content_fr, color_fr, category_fr } = req.body;

    db.query(
        `INSERT INTO product_fr (id_product, name_fr, content_fr, color_fr, category_fr)
     VALUES (?, ?, ?, ?, ?)`,
        [id_product, name_fr, content_fr, color_fr, category_fr],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });

            res.status(201).json({
                message: "French version inserted",
                id_product,
            });
        }
    );
};
