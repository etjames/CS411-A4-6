
var mongoose = require('mongoose');

// Define schema
var Schema = mongoose.Schema;

var userSchema = new Schema({
  id: String,
  name: String,
  email: String,
  favorites: String
});

// Compile model from schema
var user = mongoose.model('User', userSchema );

userSchema.methods.updateUser = function(request, response){

	this.user.name = request.body.name;
	this.user.address = request.body.address;
	 this.user.save();
	response.redirect('/user');
};



module.exports = mongoose.model('User', userSchema);