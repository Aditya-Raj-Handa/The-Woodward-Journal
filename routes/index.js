var express  = require("express"),
    router   = express.Router(),
    passport = require("passport"),
	User     = require("../models/user"),
	Delinews = require("../models/delinews"),
	Author   = require("../models/author");


// ========================================== //
// INDEX ROUTES
router.get("/", function(req, res){
		res.render("landing", {pageTitle:null});
});

router.get("/error", function(req, res){
		res.render("error");
});

router.get("/wp-admin", function(req, res){
		res.render("wp-admin-message");
});

router.get("/leadership", function(req, res){
	Author.find({}).exec(function(err, authors){
		res.render("footer/leadership", {pageTitle:"Leadership", authors:authors});
	});
});

router.get("/team", function(req, res){
	Author.find({}).sort({name: 1}).exec(function(err, authors){
		res.render("footer/team", {pageTitle:"Our Team", authors:authors});
	});
});

router.get("/contact", function(req, res){
	res.render("footer/contact", {pageTitle:"Contact"});
});

router.get("/contribute", function(req, res){
	res.redirect("https://linktr.ee/WoodwardJournal");
});

router.get("/disclaimer", function(req, res){
	res.render("footer/disclaimer", {pageTitle:"Disclaimer"});
});

router.get("/terms", function(req, res){
	res.render("footer/terms", {pageTitle:"Terms and Conditions"});
});

router.get("/licensed-images", function(req, res){
	res.render("footer/images", {pageTitle:"Licensed Images"});
});

router.get("/privacy", function(req, res){
	res.render("footer/privacy", {pageTitle:"Privacy Policy"});
});

router.get("/about", function(req, res){
	Author.find({}).exec(function(err, authors){
		res.render("footer/about", {pageTitle:"About The Journal", authors:authors});
	});
});

router.get("/partner", function(req, res){
	res.render("footer/partner", {pageTitle:"Partnership and Advertisment"});
});

router.get("/submission", function(req, res){
	res.render("footer/submission", {pageTitle:"Submission"});
});

router.get("/correction", function(req, res){
	res.render("footer/correction", {pageTitle:"Request a Correction"});
});

router.get("/public-relations", function(req, res){
	res.render("footer/relations", {pageTitle:"Public Relations"});
});

router.get("/newsletter", function(req, res){
	res.redirect("https://mailchi.mp/4555b4dfe837/the-woodward-journal-weekly-digest");
});

router.get("/IG", function(req, res){
	res.redirect("https://linktr.ee/WoodwardJournal");
});

// //Register form
// app.get("/register", middleware.isLoggedIn, function(req, res){
// 	res.render("register");
// });

// app.post("/register", function(req, res){
// 	var newUser = new User({username:req.body.username});
// 	User.register(newUser, req.body.password, function(err, user){
// 		if(err){
// 			console.log(err);
// 			res.render("register");
// 		} passport.authenticate("local")(req, res, function(){
// 			res.redirect("/");
// 		});
// 	});
// });

// LOGIN ROUTES
router.get("/login", function(req, res){
	res.render("login", {pageTitle:"Login"})
});

router.post("/login", passport.authenticate("local",
	{
		successRedirect: "/",
		failureRedirect: "/login"
	}), function(req, res){
});

router.get("/logout", function(req, res){
	req.logout();
	res.redirect("/");
});

module.exports = router;
