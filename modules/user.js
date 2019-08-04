const mongoose = require('mongoose'),
LocalStrategyMongoose = require('passport-local-mongoose');

const UserSchema = new mongoose.Schema({
username: String,
password: String,
});

UserSchema.plugin(LocalStrategyMongoose);
module.exports = mongoose.model('User', UserSchema);