var express        = require("express"),
	app            = express(),
	bodyParser     = require("body-parser"),
	mongoose       = require("mongoose"),
	passport       = require("passport"),
	LocalStrategy  = require("passport-local"),
	methodOverride = require("method-override");
	
var	middleware     = require("./middleware");

var indexRoutes    = require("./routes/index"),
	postRoutes     = require("./routes/post"),
	authorRoutes   = require("./routes/author");

var Delinews       = require("./models/delinews"),
	Author         = require("./models/author"),
	User           = require("./models/user");


mongoose.connect("mongodb+srv://AdityaRajHanda:iambatman@thedelination-wevuk.mongodb.net/delination_v3?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });
// mongoose.connect(process.env.DATABASEURL, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.set('useFindAndModify', false);
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public/"));
app.use(methodOverride("_method"));

app.locals.moment = require('moment');

// Passport Configuration
app.use(require("express-session")({
	secret: "Ady is Your God",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// ========================================== //
// LOCAL Variables
app.use(function(req, res, next) {
	res.locals.user = req.user;
	next();
});

Delinews.find({}).sort({_id:-1}).exec(function(err, delinews){
	app.locals.delinews = delinews;
});

app.locals.post=null;
app.locals.author=null;
app.locals.pageTitle=null;
app.locals.search=null;


// ========================================== //
// ROUTES


// FILTER ROUTES
app.get("/search", function(req, res){
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

app.get("/archive", function(req, res){
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

app.get("/category/:category", function(req, res){
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

app.get("/tag/:tag", function(req, res){
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


app.use(indexRoutes);
app.use(authorRoutes);
app.use(postRoutes);


app.get("/:slug", function(req, res){
	Delinews.findOne({slug: req.params.slug}).exec(function(err, foundPost){
		if(err){
			res.render("error");
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


app.get("*", function(req, res){
	res.render("error", {pageTitle:null, post:null});
});


// EXTRAS
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

var port=process.env.PORT || 3000;
var server = app.listen(port, function(){
	console.log("The Delination Server has Started...");
});