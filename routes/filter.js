var express    = require("express"),
	router     = express.Router(),
	middleware = require("../middleware/index.js"),
	Delinews   = require("../models/delinews");

// FILTER ROUTES
router.get("/search", function(req, res){
	var perPage = 10;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
	if (req.query.search){
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		Delinews.find({title:regex}).sort({_id: -1}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, delinewsPosts) {
			Delinews.countDocuments({title:regex}).exec(function (err, count) {
				if (err) {
					console.log(err);
				} else {
					res.render("index", {
						posts:delinewsPosts,
						filter:req.query.search, 
						pageTitle:"Search",
						path:"/search",
						current: pageNumber,
						pages: Math.ceil(count / perPage),
						search: req.query.search
					});
				}
			});
		});
	} else {
			
	}
});

router.get("/drafts/:department", middleware.isAdmin, function(req, res){
    Delinews.find({department:req.params.department}).sort({_id: -1}).exec(function (err, delinewsPosts) {
            if (err) {
                console.log(err);
            } else {
				res.render("drafts", {
					posts:delinewsPosts,
					filter:"Drafts", pageTitle:"Drafts",
				});
            }
    });
});

router.get("/archive", function(req, res){
	var perPage = 30;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    Delinews.find({}).sort({_id: -1}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, delinewsPosts) {
        Delinews.countDocuments({}).exec(function (err, count) {
            if (err) {
                console.log(err);
            } else {
				res.render("archive", {
					posts:delinewsPosts,
					filter:"All Posts", pageTitle:"All Posts",
					path:"/archive",
					current: pageNumber,
					pages: Math.ceil(count / perPage)
				});
            }
        });
    });
});

router.get("/category/:category", function(req, res){
	var perPage = 10;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
	Delinews.find({category:req.params.category}).sort({_id: -1}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, delinewsPosts) {
		Delinews.countDocuments({category:req.params.category}).exec(function (err, count) {
			if (err) {
				console.log(err);
			} else {
				res.render("index", {
					posts:delinewsPosts,
					category:true,
					filter:req.params.category,
					pageTitle:req.params.category,
					path:"/category/"+req.params.category,
					current: pageNumber,
					pages: Math.ceil(count / perPage)
				});
			}
		});
	});
});

router.get("/tag/:tag", function(req, res){
	var perPage = 10;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    Delinews.find({tag:req.params.tag}).sort({_id: -1}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, delinewsPosts) {
        Delinews.countDocuments({tag:req.params.tag}).exec(function (err, count) {
            if (err) {
                console.log(err);
            } else {
				res.render("index", {
					posts:delinewsPosts,
					filter:req.params.tag, pageTitle:req.params.tag,
					path:"/tag/"+req.params.tag,
					current: pageNumber,
					pages: Math.ceil(count / perPage)
				});
            }
        });
    });
});


module.exports = router;