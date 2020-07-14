var express    = require("express"),
	router     = express.Router(),
	middleware = require("../middleware/index.js"),
	Delinews   = require("../models/delinews"),
	Author     = require("../models/author"),
    multer     = require('multer');


// ========================================== //
// Upload Image Configuration 
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dgcfmftze', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


// NEW AUTHOR ROUTE
router.get("/people/new", middleware.isAdmin, function(req, res){
	res.render("author/new_author", {pageTitle:"new author"})
});


router.post("/people", middleware.isAdmin, upload.single('image'), function(req, res){
	cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
		// add cloudinary url for the image to the author object under image property
		req.body.author.image = result.secure_url;
		req.body.author.imageId = result.public_id;
		// create new post
		req.body.author.name = req.body.author.name.trim();
		var newPost = req.body.author;
		Author.create(newPost, function(err, newPost){
			if(err){
				console.log(err)
				res.redirect("/new")
			} else {
				console.log(newPost)
				res.redirect("/")}
		});
	});
});


// EDIT AUTHOR ROUTE
router.get("/people/:slug/edit", middleware.isAdmin, function(req, res){
	Author.findOne({slug: req.params.slug}).exec(function(err, foundAuthor){
		res.render("author/edit_author", {author:foundAuthor, pageTitle:"Edit Author"})
	});
});


// Update Author Route
router.put("/people/:slug", middleware.isAdmin, upload.single('image'), function(req, res){
    Author.findOne({slug: req.params.slug}, async function(err, foundAuthor){
        if(err){
            console.log(err)
            res.redirect("back");
        } else {
            if (req.file) {
              try {
                  await cloudinary.v2.uploader.destroy(foundAuthor.imageId);
                  var result = await cloudinary.v2.uploader.upload(req.file.path);
                  foundAuthor.imageId = result.public_id;
                  foundAuthor.image = result.secure_url;
              } catch(err) {
                  console.log(err)
                  return res.redirect("back");
              }
            }
            foundAuthor.name = req.body.author.name.trim();
            foundAuthor.bio = req.body.author.bio;
            foundAuthor.mail = req.body.author.mail;
            foundAuthor.authorDesignation = req.body.author.authorDesignation;
            foundAuthor.save();
            res.redirect("/people/" + foundAuthor.slug);
        }
    });
});



// Author Delete Route
router.delete("/people/:slug", middleware.isAdmin, function(req, res){
	Author.findOne({slug: req.params.slug}, async function(err, foundAuthor){
		if (err){
			console.log(err);
			res.redirect("/");
		} else {
			try {
				await cloudinary.v2.uploader.destroy(foundAuthor.imageId)
				foundAuthor.remove();
				res.redirect("/")
			} catch(err){
				console.log(err);
				res.redirect("back");
			}
		}
	});
});


// Author Page Route
router.get("/people/:author", function(req, res){
	var perPage = 10;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    Delinews.find({author:req.params.author}).sort({_id: -1}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, delinewsPosts) {
        Delinews.countDocuments({author:req.params.author}).exec(function (err, count) {
            if (err) {
                console.log(err);
				res.redirect("error");
            } else {
				if (count == 0){
					Author.findOne({slug:req.params.author}).exec(function(err, foundAuthor){
						if (foundAuthor!= null){
							Delinews.find({author:foundAuthor.name}).sort({_id: -1}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, delinewsPostsSlug) {
								Delinews.countDocuments({author:foundAuthor.name}).exec(function (err, count) {
									if (err) {
										console.log(err)
										res.redirect("error");
									} else {
										res.render("index", {
											posts:delinewsPostsSlug,
											filter:foundAuthor.name,
											pageTitle:foundAuthor.name + " - Author",
											path:"/people/"+foundAuthor.slug,
											current: pageNumber,
											author: foundAuthor,
											pages: Math.ceil(count / perPage)
										});
									}
								});
							});
						} else {
							Delinews.find({authorSlug:req.params.author}).sort({_id: -1}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, delinewsPostsSlug) {
								Delinews.countDocuments({authorSlug:req.params.author}).exec(function (err, count) {
									if (err) {
										console.log(err)
										res.redirect("error");
									} else {
										res.render("index", {
											posts:delinewsPostsSlug,
											filter:req.params.author,
											pageTitle:delinewsPostsSlug[0].title + " - Author",
											path:"/people/"+req.params.author,
											current: pageNumber,
											author: foundAuthor,
											pages: Math.ceil(count / perPage)
										});
									}
								});
							});
						}
					});
				} else {
					res.render("index", {
						posts:delinewsPosts,
						filter:req.params.author, 
						pageTitle:delinewsPosts[0].author + " - Author",
						path:"/people/"+req.params.author,
						current: pageNumber,
						pages: Math.ceil(count / perPage)
					});
				}
            }
        });
    });
});


module.exports = router