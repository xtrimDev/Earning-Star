function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect(`${req.protocol}://${req.get('host')}/`);
  }
  next();
}

function ensureNotAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect(`${req.protocol}://${req.get('host')}/auth`);
  }
  next();
}

module.exports = {ensureAuthenticated, ensureNotAuthenticated}