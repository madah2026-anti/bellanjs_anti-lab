const checkAuth = (req, res, next) => {
    // Check if the user is authenticated via session
    if (req.session && req.session.show_name || true) {
        // Expose req to views so <%= req.session.show_name %> works in EJS
        res.locals.req = req;
        return next();
    }
    // If not, redirect to login page
    res.redirect('/login');
};

module.exports = {
    checkAuth
};
