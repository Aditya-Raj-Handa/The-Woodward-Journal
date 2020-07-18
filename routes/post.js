var express    = require("express"),
	router     = express.Router(),
	middleware = require("../middleware"),
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


//==============================================//
// NEW POST ROUTE
router.get("/new", middleware.isLoggedIn, function(req, res){
	res.render("post/new", {pageTitle:"new post"});
});

router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res){
	cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
		// add cloudinary url for the image to the delinews object under image property
		req.body.delinews.image = result.secure_url;
		req.body.delinews.imageId = result.public_id;
		//Get Today's date
		var today = new Date(),
		    dd = String(today.getDate()).padStart(2, '0'),
		    mm = today.getMonth(),//January is 0!
		    yyyy = today.getFullYear(),
		    months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]; 
		today = months[mm] + ' ' + dd + ', ' + yyyy; 
		// create new post
		var newPost = req.body.delinews;
		newPost.date = today;
		req.body.delinews.tag = req.body.delinews.tag.toLowerCase();
		// req.body.delinews.tag = req.body.delinews.tag.replace(/ /g,'')
		newPost.tag = req.body.delinews.tag.split(",");
		newPost.author = req.body.delinews.author.trim();
		newPost.author = req.body.delinews.author.split(",");
		Delinews.create(newPost, function(err, newPost){
			if(err){
				console.log(err)
				res.redirect("/new")
			} else {
				console.log(newPost)
				res.redirect("/")}
		});
	});
});


// EDIT POST ROUTE
router.get("/:slug/edit", middleware.isAdmin, function(req, res){
	Delinews.findOne({slug: req.params.slug}).exec(function(err, foundPost){
		res.render("post/edit", {post:foundPost, pageTitle:"Edit Post"})
	});
});

// Update Route
router.put("/:slug", middleware.isAdmin, upload.single('image'), function(req, res){
	req.body.delinews.tag = req.body.delinews.tag.toLowerCase();
	// req.body.delinews.tag = req.body.delinews.tag.replace(/ /g,'')
	req.body.delinews.tag = req.body.delinews.tag.split(",");
	req.body.delinews.author = req.body.delinews.author.trim();
	req.body.delinews.author = req.body.delinews.author.split(",");
    Delinews.findOne({slug: req.params.slug}, async function(err, foundPost){
        if(err){
            console.log(err)
            res.redirect("back");
        } else {
            if (req.file) {
              try {
                  await cloudinary.v2.uploader.destroy(foundPost.imageId);
                  var result = await cloudinary.v2.uploader.upload(req.file.path);
                  foundPost.imageId = result.public_id;
                  foundPost.image = result.secure_url;
              } catch(err) {
                  console.log(err)
                  return res.redirect("back");
              }
            }
            foundPost.title = req.body.delinews.title;
            foundPost.content = req.body.delinews.content;
            foundPost.author = req.body.delinews.author;
            foundPost.category = req.body.delinews.category;
            foundPost.department = req.body.delinews.department;
            foundPost.status = req.body.delinews.status;
            foundPost.imgSource = req.body.delinews.imgSource;
            foundPost.tag = req.body.delinews.tag;
            foundPost.save();
            res.redirect("/" + foundPost.slug);
        }
    });
});


// Post Delete Route
router.delete("/:slug", middleware.isAdmin, function(req, res){
	Delinews.findOne({slug: req.params.slug}, async function(err, foundPost){
		if (err){
			console.log(err);
			res.redirect("/");
		} else {
			try {
				await cloudinary.v2.uploader.destroy(foundPost.imageId)
				foundPost.remove();
				res.redirect("/")
			} catch(err){
				console.log(err);
				res.redirect("back");
			}
		}
	});
});


// SHOW PAGE
router.get("/:category/:slug", function(req, res){
	Delinews.findOne({slug: req.params.slug}).exec(function(err, foundPost){
		if(err){
			res.redirect("/error");
		} else {
			if (foundPost==null || foundPost==undefined){
				Delinews.findById(req.params.slug).exec(function(err, post){
					if (post==null || post==undefined){
						return res.render("error");
					}
					Delinews.findOne({_id: {$gt: post.id}}).sort({_id: 1 }).exec(function(err, nextPost){
						Delinews.findOne({_id: {$lt: post.id}}).sort({_id: -1 }).exec(function(err, prevPost){
							res.render("post/show", {post:post, next:nextPost, prev:prevPost, pageTitle:null});
						});
					});
				});
			} else {
				Delinews.findOne({_id: {$gt: foundPost.id}}).sort({_id: 1 }).exec(function(err, nextPost){
					Delinews.findOne({_id: {$lt: foundPost.id}}).sort({_id: -1 }).exec(function(err, prevPost){
						Author.findOne({slug:foundPost.authorSlug}).exec(function(err, foundAuthor){
							res.render("post/show", {post:foundPost, author:foundAuthor, next:nextPost, prev:prevPost, pageTitle:null});
						});
					});
				});
			}
		}
	});
});


module.exports = router;
