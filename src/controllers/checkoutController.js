
const db = require("../db");
// دالة لحساب السعر بعد الخصم
const calculateFinalPrice = (price, discount) => {
    if (discount > 0) {
        return price - (price * discount) / 100;

    } else {
        return price
    }
};



exports.verifyCart = (req, res) => {
    const cart = req.body.cart;
    if (!cart || !Array.isArray(cart)) {
        return res.status(400).json({ message: "Invalid cart format" });
    }

    const ids = cart.map(item => item.id);

    if (ids.length === 0) {
        return res.json({ items: [], total: 0 });
    }

    const sql = `SELECT id, name, price , discount FROM products WHERE id IN (?)`;

    db.query(sql, [ids], (err, results) => {
        if (err) throw err;

        let total = 0;
        let verifiedItems = [];

        // Match each cart item with real DB product
        cart.forEach(item => {
            console.log(item)
            const product = results.find(p => p.id === item.id);
            if (product) {
                const subtotal = (calculateFinalPrice(product.price, product.discount)) * item.quantity;
                total += subtotal;

                verifiedItems.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    discount: product.discount,
                    quantity: item.quantity,
                    subtotal
                });
            }


        });

        return res.json({
            items: verifiedItems,
            total: total.toFixed(2)
        });
    });
};




exports.verifyCart_fr = (req, res) => {
    const cart = req.body.cart;
    if (!cart || !Array.isArray(cart)) {
        return res.status(400).json({ message: "Invalid cart format" });
    }

    const ids = cart.map(item => item.id);

    if (ids.length === 0) {
        return res.json({ items: [], total: 0 });
    }

    sql = `
  SELECT 
    p.id, 
    p.name, 
    pf.name_fr, 
    p.price, 
    p.discount 
  FROM products p
  JOIN product_fr pf ON pf.id_product = p.id
  WHERE p.id IN (?)
    `;

    db.query(sql, [ids], (err, results) => {
        if (err) throw err;

        let total = 0;
        let verifiedItems = [];

        // Match each cart item with real DB product
        cart.forEach(item => {
            console.log(item)
            const product = results.find(p => p.id === item.id);
            if (product) {
                const subtotal = (calculateFinalPrice(product.price, product.discount)) * item.quantity;
                total += subtotal;

                verifiedItems.push({
                    id: product.id,
                    name: product.name,
                    name_fr: product.name_fr,
                    price: product.price,
                    discount: product.discount,
                    quantity: item.quantity,
                    subtotal
                });
            }


        });

        return res.json({
            items: verifiedItems,
            total: total.toFixed(2)
        });
    });
};



exports.verifyCart_ar = (req, res) => {
    const cart = req.body.cart;
    if (!cart || !Array.isArray(cart)) {
        return res.status(400).json({ message: "Invalid cart format" });
    }

    const ids = cart.map(item => item.id);

    if (ids.length === 0) {
        return res.json({ items: [], total: 0 });
    }

    sql = `
  SELECT 
    p.id, 
    p.name, 
    p_ar.name_ar, 
    p.price, 
    p.discount 
  FROM products p
  JOIN product_ar p_ar ON p_ar.id_product = p.id
  WHERE p.id IN (?)
    `;

    db.query(sql, [ids], (err, results) => {
        if (err) throw err;

        let total = 0;
        let verifiedItems = [];

        // Match each cart item with real DB product
        cart.forEach(item => {
            console.log(item)
            const product = results.find(p => p.id === item.id);
            if (product) {
                const subtotal = (calculateFinalPrice(product.price, product.discount)) * item.quantity;
                total += subtotal;

                verifiedItems.push({
                    id: product.id,
                    name: product.name,
                    name_ar: product.name_ar,
                    price: product.price,
                    discount: product.discount,
                    quantity: item.quantity,
                    subtotal
                });
            }


        });

        return res.json({
            items: verifiedItems,
            total: total.toFixed(2)
        });
    });
};


exports.verifyCartIds = (req, res) => {

    const ids = req.body.cart; // [{id, quantity}, ...]
    console.log(ids)
    if (!ids || !Array.isArray(ids)) {
        return res.status(400).json({ message: "Invalid cart format" });
    }

    // Extract all product IDs

    if (ids.length === 0) {
        return res.json({ items: [], total: 0 });
    }

    // Fetch real products from database
    const sql = `SELECT id, name, price,discount FROM products WHERE id IN (?)`;

    db.query(sql, [ids], (err, results) => {
        if (err) throw err;

        let total = 0;
        let verifiedItems = [];

        // Match each cart item with real DB product
        ids.forEach(ID => {
            const product = results.find(p => p.id === ID);
            if (product) {
                const subtotal = product.price * 1;
                total += subtotal;

                verifiedItems.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    discount: product.discount,

                    quantity: 1,
                    subtotal
                });
            }
        });

        return res.json({
            items: verifiedItems,
            total
        });
    });
};

function generateID() {
    return Date.now().toString() + Math.floor(Math.random() * 10).toString();

}
exports.saveOrder = (req, res) => {
    const id = generateID();

    const { fullName, phone, email, address, items, total, status } = req.body;
    console.log({ fullName, phone, email, address, items, total, status })
    if (!items || items.length === 0) {
        return res.status(400).json({ message: "Empty order" });
    }

    const orderSql = `
      INSERT INTO orders (customer_name, phone,email, address, total, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;

    db.query(orderSql, [fullName, phone, email, address, total, status], (err, result) => {
        if (err) throw err;

        const orderId = result.insertId;

        // Insert order items
        const itemsSql = `
        INSERT INTO order_items (order_id, product_id, name, price, discount, quantity, subtotal)
        VALUES ?
      `;

        const itemsValues = items.map(item => [
            orderId,
            item.id,
            item.name,
            item.price,
            item.discount,
            item.quantity,
            item.subtotal
        ]);

        db.query(itemsSql, [itemsValues], (err2) => {
            if (err2) throw err2;

            res.json({
                message: "Your order is pending. Your Order ID is #" + orderId + ". You can use this ID to track your order.",
                message_ar: " يمكنك استخدام هذا الرقم لتتبع طلبك.. رقم الطلب هو #" + orderId + ".",
                message_fr: "Son numéro de commande est le #" + orderId + ". Vous pouvez utiliser ce numéro pour suivre votre commande.",

                orderId,
                status
            });
        });
    });
};

exports.newOrder = (req, res) => {
    const { fullName, phone, email, address, items, total, status } = req.body;
    let items_js = JSON.parse(items)
    if (!items_js || items_js.length === 0) {
        return res.status(400).json({ message: "Empty order" });
    }


    const orderSql = `
      INSERT INTO orders (customer_name, phone,email, address, total, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;

    db.query(orderSql, [fullName, phone, email, address, total, status], (err, result) => {
        if (err) throw err;

        const orderId = result.insertId;

        // Insert order items
        const itemsSql = `
        INSERT INTO order_items (order_id, product_id, name, price, discount, quantity, subtotal)
        VALUES ?
      `;

        const itemsValues = items_js.map(item => [
            orderId,
            item.id,
            item.name,
            item.price,
            item.discount,
            item.quantity,
            item.subtotal
        ]);

        db.query(itemsSql, [itemsValues], (err2) => {
            if (err2) throw err2;

            res.json({
                message: "Your order is pending. Your Order ID is #" + orderId + ". You can use this ID to track your order.",
                message_ar: " يمكنك استخدام هذا الرقم لتتبع طلبك.. رقم الطلب هو #" + orderId + ".",
                message_fr: "Son numéro de commande est le #" + orderId + ". Vous pouvez utiliser ce numéro pour suivre votre commande.",

                orderId,
                status
            });
        });
    });
};
exports.updateOrder = (req, res) => {
    const { id } = req.params;
    const { fullName, phone, email, address, items, total, status } = req.body;
    console.log({ fullName, phone, email, address, items, total, status })
    let items_js = JSON.parse(items)
    if (!items_js || items_js.length === 0) {
        return res.status(400).json({ message: "Empty order" });
    }

    // 1. Update order (NO INSERT)
    const orderSql = `
        UPDATE orders
        SET customer_name = ?,
            phone = ?,
            email = ?,
            address = ?,
            total = ?,
            status = ?
        WHERE id = ?
    `;

    db.query(
        orderSql,
        [fullName, phone, email, address, total, status, id],
        (err) => {
            if (err) throw err;

            // 2. Delete old order items
            const deleteItemsSql = `DELETE FROM order_items WHERE order_id = ?`;

            db.query(deleteItemsSql, [id], (err2) => {
                if (err2) throw err2;

                // 3. Insert updated order items
                const itemsSql = `
                    INSERT INTO order_items
                    (order_id, product_id, name, price, discount, quantity, subtotal)
                    VALUES ?
                `;

                const itemsValues = items_js.map(item => [
                    id,
                    item.id,
                    item.name,
                    item.price,
                    item.discount,
                    item.quantity,
                    item.subtotal
                ]);

                db.query(itemsSql, [itemsValues], (err3) => {
                    if (err3) throw err3;

                    res.json({
                        message: "Order updated successfully",
                        message_ar: "تم تحديث الطلب بنجاح",
                        message_fr: "Commande mise à jour avec succès",
                        orderId: id,
                        status
                    });
                });
            });
        }
    );
};



exports.deleteOrder = (req, res) => {
    const { id } = req.params;

    // 1. Delete order items first (FK safety)
    const deleteItemsSql = `
        DELETE FROM order_items
        WHERE order_id = ?
    `;

    db.query(deleteItemsSql, [id], (err) => {
        if (err) throw err;

        // 2. Delete order
        const deleteOrderSql = `
            DELETE FROM orders
            WHERE id = ?
        `;

        db.query(deleteOrderSql, [id], (err2, result) => {
            if (err2) throw err2;

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Order not found" });
            }

            res.json({
                message: "Order deleted successfully",
                orderId: id
            });
        });
    });
};


exports.getOrders = (req, res) => {
    const sql = `
      SELECT 
        o.id AS order_id,
        o.customer_name,
        o.phone,
        o.email,
        o.address,
        o.status,
        o.created_at,
        oi.id AS id,
        oi.name AS product_name,
        oi.price,
        oi.discount,
        oi.quantity,
        oi.subtotal
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      ORDER BY o.id DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }

        const orders = {};

        results.forEach(row => {
            if (!orders[row.order_id]) {
                orders[row.order_id] = {
                    order_id: row.order_id,
                    customer_name: row.customer_name,
                    phone: row.phone,
                    email: row.email,
                    address: row.address,
                    status: row.status,
                    created_at: row.created_at,
                    total: 0,
                    items: []
                };
            }

            if (row.product_name) {
                orders[row.order_id].items.push({
                    id: row.id,
                    name: row.product_name,
                    quantity: row.quantity,
                    price: row.price,
                    discount: row.discount,
                    subtotal: parseFloat(row.subtotal)
                });

                orders[row.order_id].total += parseFloat(row.subtotal);
            }
        });

        res.json(Object.values(orders));
    });
};


exports.getOrderById = (req, res) => {
    const { id } = req.params;

    const sql = `
      SELECT 
        o.id AS order_id,
        oi.id AS id,
        oi.name,
        oi.price,
        oi.quantity,
        oi.discount,
        oi.subtotal,
        o.status AS status,
        o.created_at AS created_at

      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE o.id = ?
    `;

    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }
        const items = results.map(row => {
            const discountAmount = (row.price * row.discount) / 100;
            const finalPrice = row.price - discountAmount;

            return {
                id: row.id,
                name: row.name,
                price: row.price,
                discount: row.discount,
                finalprice: finalPrice,
                quantity: row.quantity,
                subtotal: row.subtotal
            };
        });


        let total = 0;
        items.forEach(i => {
            total = total + parseFloat(i.subtotal)
        });

        let status = ''
        let created_at = ''
        if (results.length > 0) {
            status = results[0].status;
            created_at = results[0].created_at;
        }


        return res.json({
            orderId: id,
            items,
            total,
            status,
            created_at
        });
    });
};

exports.getOrderById_fr = (req, res) => {
    const { id } = req.params;

    const sql = `
      SELECT 
        o.id AS order_id,
        oi.id AS id,
        oi.name,
        p_fr.name_fr,

        oi.price,
        oi.quantity,
        oi.discount,
        oi.subtotal,
        o.status AS status,
        o.created_at AS created_at

      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN product_fr p_fr ON oi.product_id = p_fr.id_product

      WHERE o.id = ?
    `;

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.log(err)
            return res.status(500).json({ error: "Database error" });
        }
        const items = results.map(row => {
            const discountAmount = (row.price * row.discount) / 100;
            const finalPrice = row.price - discountAmount;

            return {
                id: row.id,
                name: row.name,
                name_fr: row.name_fr,
                price: row.price,
                discount: row.discount,
                finalprice: finalPrice,
                quantity: row.quantity,
                subtotal: row.subtotal
            };
        });


        let total = 0;
        items.forEach(i => {
            total = total + parseFloat(i.subtotal)
        });

        let status = ''
        let created_at = ''
        if (results.length > 0) {
            status = results[0].status;
            created_at = results[0].created_at;
        }


        return res.json({
            orderId: id,
            items,
            total,
            status,
            created_at
        });
    });
};

exports.getOrderById_ar = (req, res) => {
    const { id } = req.params;

    const sql = `
      SELECT 
        o.id AS order_id,
        oi.id AS id,
        oi.name,
        p_ar.name_ar,

        oi.price,
        oi.quantity,
        oi.discount,
        oi.subtotal,
        o.status AS status,
        o.created_at AS created_at

      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN product_ar p_ar ON oi.product_id = p_ar.id_product

      WHERE o.id = ?
    `;

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.log(err)
            return res.status(500).json({ error: "Database error" });
        }
        const items = results.map(row => {
            const discountAmount = (row.price * row.discount) / 100;
            const finalPrice = row.price - discountAmount;

            return {
                id: row.id,
                name: row.name,
                name_ar: row.name_ar,
                price: row.price,
                discount: row.discount,
                finalprice: finalPrice,
                quantity: row.quantity,
                subtotal: row.subtotal
            };
        });


        let total = 0;
        items.forEach(i => {
            total = total + parseFloat(i.subtotal)
        });

        let status = ''
        let created_at = ''
        if (results.length > 0) {
            status = results[0].status;
            created_at = results[0].created_at;
        }


        return res.json({
            orderId: id,
            items,
            total,
            status,
            created_at
        });
    });
};
