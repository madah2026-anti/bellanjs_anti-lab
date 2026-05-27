const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Vendor Main Page
router.get('/', (req, res) => {
    res.render('vendors/index', {
        title: 'الموردين',
        page: 'vendors'
    });
});

// Vendor Data List
router.get('/data', (req, res) => {
    const search = req.query.search || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM c_data WHERE cf_cat = 1';
    let countQuery = 'SELECT COUNT(*) as total FROM c_data WHERE cf_cat = 1';
    let params = [];

    if (search) {
        const searchCondition = ' AND (cf_t1 LIKE ? OR cf_t2 LIKE ? OR cf_t3 LIKE ? OR cf_t5 LIKE ?)';
        query += searchCondition;
        countQuery += searchCondition;
        const searchParams = [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`];
        params = [...searchParams];
    }

    // Add pagination to the main query
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    // First execute the main query to get data
    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Database error');
        }

        // Then execute count query (remove limit/offset params for count)
        const countParams = search ? [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`] : [];

        db.query(countQuery, countParams, (err, countResult) => {
            if (err) {
                console.error('Database count error:', err);
                // Fallback to basic rendering if count fails, though ideally handle error
                const totalVendors = results.length; // Approximate fallback
                return res.render('vendors/data', {
                    title: 'بيانات الموردين',
                    page: 'vendors',
                    subpage: 'data',
                    vendors: results,
                    totalVendors: totalVendors,
                    currentPage: page,
                    totalPages: 1,
                    search: search
                });
            }

            const totalVendors = countResult[0]?.total || 0;
            const totalPages = Math.ceil(totalVendors / limit);

            res.render('vendors/data', {
                title: 'بيانات الموردين',
                page: 'vendors',
                subpage: 'data',
                vendors: results,
                totalVendors: totalVendors,
                currentPage: page,
                totalPages: totalPages,
                search: search
            });
        });
    });
});

// Create Vendor Page
router.get('/data/create', (req, res) => {
    db.query('SELECT DISTINCT gov_name FROM gov_city ORDER BY gov_name', (err, results) => {
        if (err) {
            console.error('Error fetching governorates:', err);
            // Render without governorates if error, let UI handle or show empty
            return res.render('vendors/create', {
                title: 'إضافة مورد جديد',
                page: 'vendors',
                subpage: 'data',
                governorates: []
            });
        }

        res.render('vendors/create', {
            title: 'إضافة مورد جديد',
            page: 'vendors',
            subpage: 'data',
            governorates: results
        });
    });
});

// API: Get Cities by Governorate
router.get('/cities', (req, res) => {
    const govName = req.query.gov;
    if (!govName) {
        return res.json([]);
    }

    db.query('SELECT city_name FROM gov_city WHERE gov_name = ? ORDER BY city_name', [govName], (err, results) => {
        if (err) {
            console.error('Error fetching cities:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

// Create Vendor (POST)
router.post('/data/create', (req, res) => {
    const { cf_t1, cf_t2, cf_t3, cf_t4, cf_t5 } = req.body;

    const query = 'INSERT INTO c_data (cf_t1, cf_t2, cf_t3, cf_t4, cf_t5, cf_cat) VALUES (?, ?, ?, ?, ?, 1)';

    db.query(query, [cf_t1, cf_t2, cf_t3, cf_t4, cf_t5], (err, result) => {
        if (err) {
            console.error('Error creating vendor:', err);
            return res.status(500).send('Error creating vendor');
        }

        res.redirect('/vendors/data');
    });
});

// Edit Vendor Page
router.get('/data/edit/:id', (req, res) => {
    const vendorId = req.params.id;

    db.query('SELECT * FROM c_data WHERE id = ? AND cf_cat = 1', [vendorId], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).send('المورد غير موجود');
        }

        res.render('vendors/edit', {
            title: 'تعديل بيانات المورد',
            page: 'vendors',
            subpage: 'data',
            vendor: results[0]
        });
    });
});

// Update Vendor
router.post('/data/edit/:id', (req, res) => {
    const vendorId = req.params.id;
    const { cf_t1, cf_t2, cf_t3, cf_t4, cf_t5 } = req.body;

    const query = 'UPDATE c_data SET cf_t1 = ?, cf_t2 = ?, cf_t3 = ?, cf_t4 = ?, cf_t5 = ? WHERE id = ? AND cf_cat = 1';

    db.query(query, [cf_t1, cf_t2, cf_t3, cf_t4, cf_t5, vendorId], (err, result) => {
        if (err) {
            console.error('Error updating vendor:', err);
            return res.status(500).send('Error updating vendor');
        }

        res.redirect('/vendors/data');
    });
});

// Delete Vendor
router.get('/data/delete/:id', (req, res) => {
    const vendorId = req.params.id;

    db.query('DELETE FROM c_data WHERE id = ? AND cf_cat = 1', [vendorId], (err, result) => {
        if (err) {
            console.error('Error deleting vendor:', err);
            return res.status(500).send('Error deleting vendor');
        }

        res.redirect('/vendors/data');
    });
});

module.exports = router;