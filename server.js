// server.js

const express = require('express');
const path = require('path');
const app = express();
const compression = require('compression');
const session = require('express-session');
const { checkAuth } = require('./middleware/auth');

// Database connection
const db = require('./config/database');

// Middleware
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session Setup
app.use(session({
    secret: process.env.SESSION_SECRET || 'bella-city-super-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Globals
const CONSTANTS = require('./config/constants');
app.locals.CONSTANTS = CONSTANTS;

// Routes
app.use('/', require('./routes/index'));
app.use('/vendors', checkAuth, require('./routes/vendors'));
app.use('/customers', checkAuth, require('./routes/customers'));

// Start server
const PORT = process.env.PORT || 3000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`✅ Server running on http://localhost:${PORT}`);
        console.log(`📁 Views directory: ${path.join(__dirname, 'views')}`);
    });
}

module.exports = app;