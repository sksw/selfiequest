var mongoose = require('mongoose');
var crypto = require('crypto');
var config = require('../config');

var User = mongoose.model('User', {
  name: String,
  email: String,
  token: String,
  points: Number
});

var generateToken = function(key) {
  var salt = config.security.salt;
  return crypto.createHash('md5').update(key + salt).digest('hex');
};

var create = function(firstName, lastName, email, callback) {
  var fullName = firstName + " " + lastName;
  var user = new User({ name: fullName, firstName: firstName, email: email });
  user.token = generateToken(email + fullName);
  user.points = 0;

  user.save(callback);
};

var findByToken = function(token, callback) {
  User.findOne({token: token}, callback);
};

var getAllOtherNamesAndIds = function(myId, callback) {
  User.find({ _id: { $ne: myId} }, 'name id', null, callback);
};

var getAllSortedByRank = function(callback) {
  User.find(null, null, { sort: { points: -1 } }, callback);
};

var getAllWithRank = function(callback) {
  getAllSortedByRank(function(err, users) {
    if (err) {
      callback(err);
      return;
    }

    users.map(function(user, rank) {
      user.rank = rank + 1;
      return user;
    });

    callback(err, users);
  });
};

var getRankFor = function(userId, callback) {
  getAllWithRank(function(err, users) {
    if (err) {
      callback(err);
      return;
    }

    var foundUser = users.reduce(function(prev, curr) {
      var foundUser = (curr._id == userId) ? curr : false;
      return prev || foundUser;
    }, false);

    if (!foundUser) {
      callback("User not found in getRankFor!");
      return;
    }

    callback(err, foundUser);
  });
};

module.exports = {
  create: create,
  findByToken: findByToken,
  getAllOtherNamesAndIds: getAllOtherNamesAndIds,
  getAllWithRank: getAllWithRank,
  getRankFor: getRankFor,
  Model: User
};
