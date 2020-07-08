var mongoose = require('mongoose');

// Schema Setup
var authorSchema = new mongoose.Schema({
	name: String,
	slug: {
		type: String,
        unique: true
	},
	image: String,
	imageId: String,
	bio: String,
	mail: String,
	authorDesignation: String,
	createdAt: {type:Date, default : Date.now},
});

// add a slug before the author gets saved to the database
authorSchema.pre('save', async function (next) {
    try {
        // check if a new author is being saved, or if the author name is being modified
        if (this.isNew || this.isModified("name")) {
            this.slug = await generateUniqueSlug(this._id, this.name);
        }
        next();
    } catch (err) {
        next(err);
    }
});

var Author = mongoose.model("Author", authorSchema);
module.exports = Author;

async function generateUniqueSlug(id, delinewsName, slug) {
    try {
        // generate the initial slug
        if (!slug) {
            slug = slugify(delinewsName);
        }
        // check if a delinews with the slug already exists
        var delinews = await Author.findOne({slug: slug});
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
      .substring(0, 75);           // Trim at 75 characters
    return slug // Add 4 random digits to improve uniqueness
}