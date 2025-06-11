function ifAdminRedirectAdmin(req, res, next) {
    if (req.user.type == 1) {
        return res.redirect(`${req.protocol}://${req.get('host')}/admin/`);
    }
    next();
}

function ifNotAdminRedirectHome(req, res, next) {
    if (req.user.type != 1) {
        return res.redirect(`${req.protocol}://${req.get('host')}/`);
    }
    next();
}

module.exports = { ifAdminRedirectAdmin, ifNotAdminRedirectHome }