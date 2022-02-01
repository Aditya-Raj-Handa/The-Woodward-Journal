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
	filterRoutes   = require("./routes/filter"),
	authorRoutes   = require("./routes/author");

var Delinews       = require("./models/delinews"),
	Author         = require("./models/author"),
	User           = require("./models/user");

mongoose.connect(process.env.DATABASEURL, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.set('useFindAndModify', false);
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public/"));
app.use(methodOverride("_method"));

app.locals.moment = require('moment');

// Passport Configuration
app.use(require("express-session")({
	secret: "SeCrEt",
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

Delinews.find({status:{$nin:["draft", "finalDraft"]}}).sort({_id:-1}).exec(function(err, delinews){
	app.locals.delinews = delinews;
});

app.locals.post=null;
app.locals.category=null;
app.locals.author=null;
app.locals.pageTitle=null;
app.locals.search=null;


// ========================================== //
// ROUTES


app.use(indexRoutes);
app.use(filterRoutes);
app.use(authorRoutes);
app.use(postRoutes);


app.get("/:slug", function(req, res){
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


app.get("*", function(req, res){
	res.render("error", {pageTitle:null, post:null});
});

var port=process.env.PORT || 3000;
var server = app.listen(port, function(){
	console.log("The Delination Server has Started...");
});
