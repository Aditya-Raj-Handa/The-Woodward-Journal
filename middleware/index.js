var middleware = {
isLoggedIn: function (req, res, next){
	if (req.isAuthenticated()){
		return next();
	} else {
		res.redirect("/error");
	}
	},

isAdmin: function (req, res, next){
	if (req.isAuthenticated() && (req.user.username == "admin" || req.user.username == "editor")){
		return next();
	} else {
		res.redirect("/error");
	}
	}
	
}
module.exports = middleware;