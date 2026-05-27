const express = require('express');
const router = express.Router();
const db = require('../config/database');
const CONSTANTS = require('../config/constants');
const P_CATS = CONSTANTS.P_CATS;

// customer Main Page
router.get('/', (req, res) => {
    res.render('customers/index', {
        title: 'العملاء',
        page: 'customers'
    });
});

// customer Data List
router.get('/data', (req, res) => {
    const search = req.query.search || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM c_data WHERE cf_cat = 4';
    let countQuery = 'SELECT COUNT(*) as total FROM c_data WHERE cf_cat = 4';
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
                const totalcustomers = results.length; // Approximate fallback
                return res.render('customers/data', {
                    title: 'بيانات العملاء',
                    page: 'customers',
                    subpage: 'data',
                    customers: results,
                    totalcustomers: totalcustomers,
                    currentPage: page,
                    totalPages: 1,
                    search: search
                });
            }

            const totalcustomers = countResult[0]?.total || 0;
            const totalPages = Math.ceil(totalcustomers / limit);

            res.render('customers/data', {
                title: 'بيانات العملاء',
                page: 'customers',
                subpage: 'data',
                customers: results,
                totalcustomers: totalcustomers,
                currentPage: page,
                totalPages: totalPages,
                search: search
            });
        });
    });
});


// Create customer Page
router.get('/data/create', (req, res) => {
    res.render('customers/create', {
        title: 'إضافة عميل جديد',
        page: 'customers',
        subpage: 'data'
    });
});

// Create customer (POST)
router.post('/data/create', (req, res) => {
    const { cf_t1, cf_t2, cf_t3, cf_t4, cf_t5 } = req.body;

    const query = 'INSERT INTO c_data (cf_t1, cf_t2, cf_t3, cf_t4, cf_t5, cf_cat) VALUES (?, ?, ?, ?, ?, 4)';

    db.query(query, [cf_t1, cf_t2, cf_t3, cf_t4, cf_t5], (err, result) => {
        if (err) {
            console.error('Error creating customer:', err);
            return res.status(500).send('Error creating customer');
        }

        res.redirect('/customers/data');
    });
});

// Edit customer Page
router.get('/data/edit/:id', (req, res) => {
    const customerId = req.params.id;

    db.query('SELECT * FROM c_data WHERE id = ? AND cf_cat = ' + P_CATS.CUSTOMERS, [customerId], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).send('العميل غير موجود');
        }

        res.render('customers/edit', {
            title: 'تعديل بيانات العميل',
            page: 'customers',
            subpage: 'data',
            customer: results[0]
        });
    });
});

// Update customer
router.post('/data/edit/:id', (req, res) => {
    const customerId = req.params.id;
    const { cf_t1, cf_t2, cf_t3, cf_t4, cf_t5 } = req.body;

    const query = 'UPDATE c_data SET cf_t1 = ?, cf_t2 = ?, cf_t3 = ?, cf_t4 = ?, cf_t5 = ? WHERE id = ? AND cf_cat = ' + P_CATS.CUSTOMERS;

    db.query(query, [cf_t1, cf_t2, cf_t3, cf_t4, cf_t5, customerId], (err, result) => {
        if (err) {
            console.error('Error updating customer:', err);
            return res.status(500).send('Error updating customer');
        }

        res.redirect('/customers/data');
    });
});

// Delete customer
router.get('/data/delete/:id', (req, res) => {
    const customerId = req.params.id;

    db.query('DELETE FROM c_data WHERE id = ? AND cf_cat = ' + P_CATS.CUSTOMERS, [customerId], (err, result) => {
        if (err) {
            console.error('Error deleting customer:', err);
            return res.status(500).send('Error deleting customer');
        }

        res.redirect('/customers/data');
    });
});

// customer sales invoice List
router.get('/sales_list', (req, res) => {
    const search = req.query.search || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM cash WHERE cash_posted<7 and cash_cat in (5,57,55,89,111) ';
    let countQuery = 'SELECT COUNT(*) as total FROM cash WHERE cash_posted<7 and cash_cat in (5,57,55,89,111) ';
    let searchParams = [];

    if (search) {
        const searchCondition = ' AND (cash_cv_name LIKE ? OR cash_ser LIKE ? OR cash_notes LIKE ? )';
        query += searchCondition;
        countQuery += searchCondition;
        searchParams = [`%${search}%`, `%${search}%`, `%${search}%`];
    }

    query += " order by cash_cat,cash_ser";
    // Add pagination to the main query
    // query += ' LIMIT ? OFFSET ?';
    // searchParams.push(limit, offset);
    console.error('cur query:', query);
    console.error('cur params:', searchParams);
    // First execute the main query to get data
    db.query(query, searchParams, (err, results) => {
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
                const sales_invs_cnt = results.length; // Approximate fallback
                return res.render('customers/docs_list', {
                    title: 'فواتير المبيعات',
                    page: 'customers',
                    subpage: 'docs_list',
                    sales_invs: results,
                    sales_invs_cnt: sales_invs_cnt,
                    currentPage: page,
                    totalPages: 1,
                    search: search,
                    pagebackto: '/customers/sales_list'
                });
            }

            const sales_invs_cnt = countResult[0]?.total || 0;
            const totalPages = Math.ceil(sales_invs_cnt / limit);

            res.render('customers/docs_list', {
                title: 'فواتير المبيعات',
                page: 'customers',
                subpage: 'docs_list',
                sales_invs: results,
                sales_invs_cnt: sales_invs_cnt,
                currentPage: page,
                totalPages: totalPages,
                search: search,
                pagebackto: '/customers/sales_list'
            });
        });
    });
});

// customer bounce List
router.get('/bounce_list', (req, res) => {
    const search = req.query.search || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM cash WHERE cash_posted<7 and cash_cat in (30,59,122) ';
    let countQuery = 'SELECT COUNT(*) as total FROM cash WHERE cash_posted<7 and cash_cat in (30,59,122) ';
    let searchParams = [];

    if (search) {
        const searchCondition = ' AND (cash_cv_name LIKE ? OR cash_ser LIKE ? OR cash_notes LIKE ? )';
        query += searchCondition;
        countQuery += searchCondition;
        searchParams = [`%${search}%`, `%${search}%`, `%${search}%`];
    }

    query += " order by cash_cat,cash_ser";
    // Add pagination to the main query
    // query += ' LIMIT ? OFFSET ?';
    // searchParams.push(limit, offset);
    console.error('cur query:', query);
    console.error('cur params:', searchParams);
    // First execute the main query to get data
    db.query(query, searchParams, (err, results) => {
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
                const sales_invs_cnt = results.length; // Approximate fallback
                return res.render('customers/docs_list', {
                    title: 'حوافز العملاء',
                    page: 'customers',
                    subpage: 'docs_list',
                    sales_invs: results,
                    sales_invs_cnt: sales_invs_cnt,
                    currentPage: page,
                    totalPages: 1,
                    search: search,
                    pagebackto: '/customers/bounce_list'
                });
            }

            const sales_invs_cnt = countResult[0]?.total || 0;
            const totalPages = Math.ceil(sales_invs_cnt / limit);

            res.render('customers/docs_list', {
                title: 'حوافز العملاء',
                page: 'customers',
                subpage: 'docs_list',
                sales_invs: results,
                sales_invs_cnt: sales_invs_cnt,
                currentPage: page,
                totalPages: totalPages,
                search: search,
                pagebackto: '/customers/bounce_list'
            });
        });
    });
});


// customer gifts List
router.get('/gifts_list', (req, res) => {
    const search = req.query.search || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM cash WHERE cash_posted<7 and cash_cat in (29,87,76,120) ';
    let countQuery = 'SELECT COUNT(*) as total FROM cash WHERE cash_posted<7 and cash_cat in (29,87,76,120) ';
    let searchParams = [];

    if (search) {
        const searchCondition = ' AND (cash_cv_name LIKE ? OR cash_ser LIKE ? OR cash_notes LIKE ? )';
        query += searchCondition;
        countQuery += searchCondition;
        searchParams = [`%${search}%`, `%${search}%`, `%${search}%`];
    }

    query += " order by cash_cat,cash_ser";
    // Add pagination to the main query
    // query += ' LIMIT ? OFFSET ?';
    // searchParams.push(limit, offset);
    console.error('cur query:', query);
    console.error('cur params:', searchParams);
    // First execute the main query to get data
    db.query(query, searchParams, (err, results) => {
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
                const sales_invs_cnt = results.length; // Approximate fallback
                return res.render('customers/docs_list', {
                    title: 'هدايا العملاء',
                    page: 'customers',
                    subpage: 'docs_list',
                    sales_invs: results,
                    sales_invs_cnt: sales_invs_cnt,
                    currentPage: page,
                    totalPages: 1,
                    search: search,
                    pagebackto: '/customers/gifts_list'
                });
            }

            const sales_invs_cnt = countResult[0]?.total || 0;
            const totalPages = Math.ceil(sales_invs_cnt / limit);

            res.render('customers/docs_list', {
                title: 'هدايا العملاء',
                page: 'customers',
                subpage: 'docs_list',
                sales_invs: results,
                sales_invs_cnt: sales_invs_cnt,
                currentPage: page,
                totalPages: totalPages,
                search: search,
                pagebackto: '/customers/gifts_list'
            });
        });
    });
});

// Create sale invoice
router.get('/sales_create', async (req, res) => {
    try {
        const [customers, stocks, agents, items] = await Promise.all([
            new Promise((resolve, reject) => db.query('SELECT * FROM c_data WHERE cf_n1>0 and cf_cat = 4', (err, results) => err ? reject(err) : resolve(results))),
            new Promise((resolve, reject) => db.query('SELECT * FROM c_data WHERE cf_cat = 18', (err, results) => err ? reject(err) : resolve(results))),
            new Promise((resolve, reject) => db.query('SELECT * FROM c_data WHERE cf_cat = 25', (err, results) => err ? reject(err) : resolve(results))),
            new Promise((resolve, reject) => db.query('SELECT * FROM items', (err, results) => err ? reject(err) : resolve(results)))
        ]);

        res.render('customers/doc_create', {
            title: 'إضافة فاتورة جديدة',
            page: 'customers',
            subpage: 'docs_list',
            customers,
            stocks,
            agents,
            items
        });
    } catch (err) {
        console.error('Database error on load:', err);
        res.status(500).send('Database error');
    }
});

// Save new sale invoice
router.post('/sales_create', async (req, res) => {
    try {
        const { cash_cv_id, cash_stock_id, cash_agent_id, cash_date, cash_notes, cash_driver_name, items } = req.body;

        // Items from parsed body might be object like items[0][item_id], normalize it
        let normalizedItems = [];
        if (items) {
            normalizedItems = Array.isArray(items) ? items : Object.values(items);
        }

        let cash_amount = 0;
        normalizedItems.forEach(item => {
            const qty = parseFloat(item.item_qty) || 0;
            const price = parseFloat(item.item_price) || 0;
            cash_amount += (qty * price);
        });

        // Get missing names from DB
        const [cvRes] = await new Promise((resolve, reject) => db.query('SELECT cf_t1 FROM c_data WHERE cf_id = ?', [cash_cv_id], (err, r) => err ? reject(err) : resolve(r)));
        const [stockRes] = await new Promise((resolve, reject) => db.query('SELECT cf_t1 FROM c_data WHERE cf_id = ?', [cash_stock_id], (err, r) => err ? reject(err) : resolve(r)));
        let agentRes = null;
        if (cash_agent_id) {
            const [aRes] = await new Promise((resolve, reject) => db.query('SELECT cf_t1 FROM c_data WHERE cf_id = ?', [cash_agent_id], (err, r) => err ? reject(err) : resolve(r)));
            agentRes = aRes;
        }

        const cash_cv_name = cvRes ? cvRes.cf_t1 : '';
        const cash_stock_name = stockRes ? stockRes.cf_t1 : '';
        const cash_agent_name = agentRes ? agentRes.cf_t1 : '';

        // Get next cash_ser
        const cash_cat = P_CATS.cust_sale_poly;
        const [seqRes] = await new Promise((resolve, reject) => db.query('SELECT IFNULL(MAX(cash_ser), 0) + 1 AS next_ser FROM cash WHERE cash_cat = ?', [cash_cat], (err, r) => err ? reject(err) : resolve(r)));
        const cash_ser = seqRes.next_ser;

        const insertCashQuery = `
            INSERT INTO cash 
            (cash_ser, cash_cat, cash_amount, cash_date, cash_notes, cash_driver_name, cash_cv_id, cash_stock_id, cash_agent_id, cash_cv_name, cash_stock_name, cash_agent_name, SYS_DT) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;
        const cashParams = [
            cash_ser,
            cash_cat,
            cash_amount,
            cash_date,
            cash_notes || '',
            cash_driver_name || '',
            cash_cv_id,
            cash_stock_id,
            cash_agent_id || 0, // default value for int like schema suggests
            cash_cv_name,
            cash_stock_name,
            cash_agent_name
        ];
        console.error('cur query:', cashParams);
        await new Promise((resolve, reject) => db.query(insertCashQuery, cashParams, (err, r) => err ? reject(err) : resolve(r)));

        // Insert items
        if (normalizedItems.length > 0) {
            const insertDetailsQuery = `
                INSERT INTO cash_details 
                (cash_ser, Stock_id, item_id, item_price, item_qty, aitem_qty, cd_tot, cd_date, cd_cat, sys_dt) 
                VALUES ?
            `;
            // The item_qty in details often has negative for sales (out of stock), but let's follow existing data pattern
            // Wait, looking at `sales_inv_show.ejs` or route, `item_qty*-1 as item_qty` implies the stored `item_qty` is negative.
            // Oh right, sale implies reducing stock (negative qty).
            const detailsValues = normalizedItems.map(item => {
                const qty = parseFloat(item.item_qty) || 0;
                // negative quantity for sale
                const dbQty = qty * -1;
                const price = parseFloat(item.item_price) || 0;
                const tot = qty * price; // usually total is positive in cash_details for sales or could be just qty*price
                // looking at getter `item_qty*-1 as item_qty,item_price,cd_tot`, cd_tot is displayed positively.
                return [cash_ser, cash_stock_id, item.item_id, price, dbQty, dbQty, tot, cash_date, cash_cat, new Date()];
            });
            await new Promise((resolve, reject) => db.query(insertDetailsQuery, [detailsValues], (err, r) => err ? reject(err) : resolve(r)));
        }

        res.redirect(`/customers/doc_show/${cash_ser}`);

    } catch (err) {
        console.error('Error saving invoice:', err);
        res.status(500).send('حدث خطأ أثناء حفظ الفاتورة');
    }
});

// Show sale invoice details
router.get('/doc_show/:cash_ser', (req, res) => {
    const cash_ser = req.params.cash_ser;

    // We get the invoice header
    db.query('SELECT cash.*,(cash_discount*100/(cash_discount+cash_amount)) as cash_discount_percent FROM cash WHERE cash_ser = ?', [cash_ser], (err, headerResults) => {
        if (err) {
            console.error('Database error on header load:', err);
            return res.status(500).send('Database error');
        }

        if (headerResults.length === 0) {
            return res.status(404).send('الفاتورة غير موجودة');
        }

        const invoiceHeader = headerResults[0];

        // Fetch the details and join with items for the name
        const detailsQuery = `
            SELECT cd.*, i.item_name 
            FROM (select item_id,item_qty*-1 as item_qty,item_price,cd_tot,cash_ser from cash_details 
            WHERE cash_ser = ? ) as cd 
            LEFT JOIN items i ON cd.item_id = i.item_id 
            
        `;

        db.query(detailsQuery, [cash_ser], (err, detailsResults) => {
            if (err) {
                console.error('Database error on details load:', err);
                return res.status(500).send('Database error');
            }

            res.render('customers/doc_show', {
                title: 'تفاصيل فاتورة المبيعات',
                page: 'customers',
                subpage: 'docs_list',
                invoice: invoiceHeader,
                details: detailsResults
            });
        });
    });
});

module.exports = router;