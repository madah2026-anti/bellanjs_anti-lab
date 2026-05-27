const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { checkAuth } = require('../middleware/auth');

// Home/Dashboard (Protected)
router.get('/', checkAuth, (req, res) => {
    let countQuery = 'SELECT COUNT(*) as total FROM c_data WHERE cf_cat = 4';
    db.query(countQuery, "", (err, countResult) => {
        if (err) {
            console.error('Database count error:', err);
            // Fallback to basic rendering if count fails, though ideally handle error
            const totalcustomers = results.length; // Approximate fallback
        }
        const totalcustomers = countResult[0]?.total || 0;
        res.render('index', {
            title: 'بيلا سيتي - لوحات التحكم',
            page: 'dashboard',
            totalcustomers: totalcustomers
        })
    });
});

// Reports Page
router.get('/reports', checkAuth, (req, res) => {
    res.render('reports', {
        title: 'التقارير',
        page: 'reports'
    });
});

// Login Page
router.get('/login', (req, res) => {
    res.render('login', {
        title: 'تسجيل الدخول'
    });
});

// Process Login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.query('SELECT * FROM users WHERE user_name = ?', [username], (err, results) => {
        if (err) throw err;

        if (results.length > 0 && results[0].user_password === password) {
            req.session.show_name = results[0].show_name;
            return res.redirect('/');
        } else {
            return res.render('login', {
                title: 'تسجيل الدخول',
                error: 'اسم المستخدم أو كلمة المرور غير صحيحة'
            });
        }
    });
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/login');
    });
});

// Report Data API
router.get('/api/report-data', checkAuth, (req, res) => {
    const reportId = parseInt(req.query.reportId, 10);

    let query = 'SELECT cf_t1, cf_id FROM c_data WHERE cf_cat = ?';
    let cf_cat = 79723; // Default clear it

    switch (reportId) {
        // suppliers
        case 110:
        case 130:
        case 268:
            cf_cat = 1;
            break;
        case 140:
        case 260:
        case 264:
        case 265:
        case 266:
        case 280:
        case 282:
            cf_cat = 18;
            break;
        // inventory
        case 250:
        case 270:
            query = 'SELECT item_name as cf_t1, item_id as cf_id FROM items';
            cf_cat = null;
            break;
        case 290:
        case 430:
        case 435:
        case 436:
            cf_cat = 8888; // tst
            break;
        // customers
        case 415:
        case 440:
        case 450:
            cf_cat = 4;
            break;
        case 416:
            cf_cat = 42;
            break;
        case 417:
            cf_cat = 52;
            break;
        default:
            break;
    }

    const queryParams = cf_cat !== null ? [cf_cat] : [];

    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error('Error fetching report search data:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

module.exports = router;