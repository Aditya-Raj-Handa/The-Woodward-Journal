var middleware = {
isLoggedIn: function (req, res, next){
	if (req.isAuthenticated()){
		return next();
	} else {
		res.redirect("/login");
	}
	},

isAdmin: function (req, res, next){
	if (req.isAuthenticated() && req.user.username == "admin"){
		return next();
	} else {
		res.redirect("/login");
	}
	}
	
}
module.exports = middleware;