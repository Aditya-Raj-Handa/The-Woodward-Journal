var mongoose = require('mongoose');

// Schema Setup
var delinewsSchema = new mongoose.Schema({
	title: String,
	slug: {
		type: String,
        unique: true
	},
	authorSlug: {
		type: String,
        unique: true
	},
	image: String,
	imageId: String,
	content: String,
	author: Array,
	category: String,
	date: String,
	imgSource: String,
	createdAt: {type:Date, default : Date.now},
	tag: Array
});

// add a slug before the delinews gets saved to the database
delinewsSchema.pre('save', async function (next) {
    try {
        // check if a new delinews is being saved, or if the delinews name is being modified
        if (this.isNew || this.isModified("title")) {
            this.slug = await generateUniqueSlug(this._id, this.title);
            this.authorSlug = await slugify(this.author);
        }
        next();
    } catch (err) {
        next(err);
    }
});

var Delinews = mongoose.model("Delinews", delinewsSchema);
module.exports = Delinews;

async function generateUniqueSlug(id, delinewsName, slug) {
    try {
        // generate the initial slug
        if (!slug) {
            slug = slugify(delinewsName);
        }
        // check if a delinews with the slug already exists
        var delinews = await Delinews.findOne({slug: slug});
        // check if a delinews was found or if the found delinews is the current delinews
        if (!delinews || delinews._id.equals(id)) {
            return slug;
        }
        // if not unique, generate a new slug
        var newSlug = slugify(delinewsName);
        // check again by calling the function recursively
        return await generateUniqueSlug(id, delinewsName, newSlug);
    } catch (err) {
        throw new Error(err);
    }
}

function slugify(text) {
    var slug = text.toString().toLowerCase()
      .replace(/\s+/g, '-')        // Replace spaces with -
      .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
      .replace(/\-\-+/g, '-')      // Replace multiple - with single -
      .replace(/^-+/, '')          // Trim - from start of text
      .replace(/-+$/, '')          // Trim - from end of text
      .substring(0, 200);          // Trim at 200 characters
    return slug // Add 4 random digits to improve uniqueness
}