module.exports = function (req, res, next) {
  // Check if admin is logged in
  if (req.session && req.session.admin) {
    return next(); // continue to route
  }

  // If not admin, redirect to admin login page
  return res.redirect("/admin/login");
};

