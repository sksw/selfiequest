var mongoose = require('mongoose');
var user = require('./user');
var selfie = require('./selfie');

var ObjectId = mongoose.Schema.ObjectId;

var Target = mongoose.model('Target', {
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  target: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: { type: String, default: "in progress" },
  value: { type: Number, default: 25 },
  timestamp: { type: Date, default: Date.now }
});


var generateNextTarget = function(ownerId, callback, quantity, data) {
  quantity = (typeof quantity === "undefined") ? 1: quantity;
  // $1 Find every user
    // $2 Find every selfie i took or am tagged in
      // $3 Eliminate from $1 every 'other' user tagged in $2
  var owner = ObjectId(ownerId);
  user.Model.find(function(err, users) {
    var potentialTargets = [];
    users.map(function(user) {
      potentialTargets[user._id] = user;
    });
    
    delete potentialTargets[ownerId];
    
    selfie.findSelfiesFor(ownerId, function(err, selfies) {
      selfies.map(function(selfie) {
        var otherUser = (selfie.owner == ownerId) ? selfie.tagged : selfie.owner;
        delete potentialTargets[otherUser];
      });
      Target.find({ owner: owner}, function(err, existingTargets) {
        existingTargets.map(function(xTarget) {
          delete potentialTargets[xTarget.target];
        });
        var targets = [];
        for (var target in potentialTargets) {
          targets.push(potentialTargets[target]);
        }
        
        newTargets = targets.slice(0, quantity);
        
        var counter = 0;
        if (newTargets.length > 0) {
          newTargets.map(function(targetUser) {
            var newTarget = new Target({
              owner: owner,
              target: targetUser    
            });
            var cb = function() {};
            if (counter++ === 0) {
              cb = function(error) { callback(error, data); };
            }
            newTarget.save(cb);
          });
        }
        else {
          callback(err, data);
        }
      });      
    });
  });
};

module.exports = {
  generateNextTarget: generateNextTarget
};
