
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// Define schema
var userSchema = mongoose.Schema;

var userSchema = new Schema({
  name: String,
  email: String,
  favorites: String
});

// Compile model from schema
var dbmodel = mongoose.model('usercollection', UserCollection );

userSchema.methods.updateUser = function(request, response){

	this.user.name = request.body.name;
	this.user.address = request.body.address;
	 this.user.save();
	response.redirect('/user');
};



module.exports = mongoose.model('usercollection', userSchema);