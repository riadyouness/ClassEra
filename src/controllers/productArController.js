const db = require("../db");

// ✅ البحث مع الترقيم والفلاتر (باللغة العربية)
exports.getPaginatedProducts_ar = (req, res) => {
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
            p_ar.name_ar,
            p.price,
            p.color,
            p_ar.color_ar,
            p.discount,
            p.size,
            p.image,
            p.category,
            p.sold,
            p.stock
        FROM products p
        LEFT JOIN product_ar p_ar 
            ON p.id = p_ar.id_product
        WHERE p.status = 'public' 
            AND (p_ar.name_ar LIKE ?) 
            AND (p.price - (p.price * p.discount / 100)) BETWEEN ? AND ?
    `;

    let params = [search, minPrice, maxPrice];

    // فلتر الحجم
    if (size && size !== "All") {
        if (size === "Small") sql += " AND p.size <= 20";
        else if (size === "Medium") sql += " AND p.size > 20 AND p.size <= 40";
        else if (size === "Large") sql += " AND p.size > 40";
    }

    // فلتر التصنيف
    if (category && category > 0) {
        sql += " AND p.category = ?";
        params.push(category);
    }

    // فلتر اللون
    if (color && color !== "All") {
        sql += " AND p.color LIKE ?";
        params.push(color);
    }

    sql += " ORDER BY p.id DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    db.query(sql, params, (err, results) => {
        if (err) throw err;

        // استعلام العد الكلي
        let countSql = `
                SELECT COUNT(*) AS total
                FROM products p
                LEFT JOIN product_ar p_ar 
                    ON p.id = p_ar.id_product
                WHERE p.status = 'public'  
                AND p_ar.name_ar LIKE ?
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
// آخر 8 منتجات (الكل) - نسخة عربية
// ------------------------------------------------------
exports.getLastAllProduct_ar = (req, res) => {
    const sql = ` SELECT 
        p.id,
        p.slug,
        p.name,
        p.price,
        p.color,
        p.discount,
        p.size,
        p.image,
        ar.name_ar,
        ar.color_ar,
        ar.category_ar,
        p.sold,
        p.stock
    FROM products p
    LEFT JOIN product_ar ar ON p.id = ar.id_product
    WHERE status='public' AND stock > sold AND size > 0 AND datecreate >= DATE_SUB(CURRENT_DATE(), INTERVAL 9 MONTH)
    ORDER BY p.id DESC
    LIMIT 8;
  `;
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
};

// ------------------------------------------------------
// آخر المنتجات (5 فقط) - نسخة عربية
// ------------------------------------------------------
exports.getLastProduct_ar = (req, res) => {
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
        ar.name_ar,
        ar.color_ar,
        c.name_ar AS category_ar
    FROM products p
    LEFT JOIN product_ar ar ON p.id = ar.id_product
    LEFT JOIN categories c ON p.category = c.id_category
    WHERE status='public' AND size > 0 AND stock > sold AND datecreate >= DATE_SUB(CURRENT_DATE(), INTERVAL 9 MONTH)
    ORDER BY p.id DESC
    LIMIT 5;
  `;
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
};


// ------------------------------------------------------
// المنتجات الجديدة (وصل حديثاً)
// ------------------------------------------------------
exports.getArrivalsProduct_ar = (req, res) => {
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
    ar.name_ar,
    ar.color_ar,
    c.name_ar AS category_ar 
  
  FROM products p
  LEFT JOIN product_ar ar ON p.id = ar.id_product
  LEFT JOIN categories c ON p.category = c.id_category 
  WHERE status='public' AND size > 0 AND stock > sold AND datecreate >= DATE_SUB(CURRENT_DATE(), INTERVAL 9 MONTH)

ORDER BY p.id DESC
LIMIT 10;
  `;
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
};

// ------------------------------------------------------
// منتجات عليها تخفيضات
// ------------------------------------------------------
exports.getDiscoutProduct_ar = (req, res) => {
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
    ar.name_ar,
    ar.color_ar,
    c.name_ar AS category_ar 
  
  FROM products p
  LEFT JOIN product_ar ar ON p.id = ar.id_product
  LEFT JOIN categories c ON p.category = c.id_category
  
  WHERE  p.discount > 0 AND status='public'

  ORDER BY p.discount DESC
  LIMIT 8;
  `;
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);


    });
};

// ------------------------------------------------------
// منتجات فاخرة (حسب السعر الأعلى)
// ------------------------------------------------------
exports.getQualityProduct_ar = (req, res) => {
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
    ar.name_ar,
    ar.color_ar,
    c.name_ar AS category_ar
  
  FROM products p
  LEFT JOIN product_ar ar ON p.id = ar.id_product
  LEFT JOIN categories c ON p.category = c.id_category 
  
  WHERE p.price > 450 AND status='public'

  ORDER BY p.price DESC
  LIMIT 8;
  `;
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
};

// ------------------------------------------------------
// المنتج عبر الرابط (Slug)
// ------------------------------------------------------
exports.getProductBySlug_ar = (req, res) => {
    const sql = `
    SELECT 
    p.id, p.name, p.sku, p.brand, p.slug, p.content, p_ar.name_ar, p_ar.content_ar, p.price, p.color, p_ar.color_ar, p.size,
    p.category, p.image, p.datecreate, p.discount,
    p.fit, p.material, p_ar.material_ar, p.dimension, p.sold, p.stock,
    pi.image_1, pi.image_2, pi.image_3, pi.image_4, video
    
    FROM products AS p
    LEFT JOIN product_ar p_ar ON p.id = p_ar.id_product
    LEFT JOIN product_images AS pi ON p.id = pi.id_product
    WHERE status='public' AND slug = ?
    LIMIT 1
  `;

    db.query(sql, [req.params.slug], (err, result) => {
        if (err) throw err;
        if (!result.length) return res.status(404).json({ message: "المنتج غير موجود" });
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
// التصنيفات (مجمعة)
// ------------------------------------------------------
exports.getCategories_grouped_ar = (req, res) => {
    const sql = `
    SELECT 
      a.category_ar,
      p.category AS category,
      COUNT(*) AS count
    FROM products p
    LEFT JOIN product_ar a ON p.id = a.id_product
    GROUP BY a.category_ar
    ORDER BY a.category_ar
  `;

    db.query(sql, (err, results) => {
        if (err) throw err;

        const total = results.reduce((sum, c) => sum + c.count, 0);

        const categories = [
            { category: "All", category_ar: "الكل", count: total },
            ...results
        ];

        res.json(categories);
    });
};

// ------------------------------------------------------
// الألوان
// ------------------------------------------------------
exports.getColors_ar = (req, res) => {
    const sql = `
    SELECT 
      a.color_ar AS color_ar,
      p.color AS color,
      COUNT(*) AS count
    FROM products p
    LEFT JOIN product_ar a ON p.id = a.id_product
    GROUP BY a.color_ar, p.color 
    ORDER BY count
  `;

    db.query(sql, (err, results) => {
        if (err) throw err;

        const total = results.reduce((sum, c) => sum + c.count, 0);

        const colors = [
            { color: "All", color_ar: "الكل", count: total },
            ...results
        ];

        res.json(colors);
    });
};

// ------------------------------------------------------
// الأحجام
// ------------------------------------------------------
exports.getSizes_ar = (req, res) => {
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
            if (r.sizeName === "Large") r.sizeName_ar = "كبير";
            if (r.sizeName === "Medium") r.sizeName_ar = "متوسط";
            if (r.sizeName === "Small") r.sizeName_ar = "صغير";
            if (r.sizeName === "Other") r.sizeName_ar = "أخرى";
        });

        const total = results.reduce((sum, item) => sum + item.count, 0);

        const sizes = [
            { sizeName: "All", sizeName_ar: "الكل", count: total },
            ...results
        ];

        res.json(sizes);
    });
};

// ------------------------------------------------------
// إضافة ترجمة عربية للمنتج
// ------------------------------------------------------
exports.createProduct_ar = (req, res) => {
    const { id_product, name_ar, content_ar, color_ar, category_ar } = req.body;

    db.query(
        `INSERT INTO product_ar (id_product, name_ar, content_ar, color_ar, category_ar)
     VALUES (?, ?, ?, ?, ?)`,
        [id_product, name_ar, content_ar, color_ar, category_ar],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });

            res.status(201).json({
                message: "تم حفظ النسخة العربية",
                id_product,
            });
        }
    );
};