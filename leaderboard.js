// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players."

Players = new Meteor.Collection("players");

if (Meteor.is_client) {
  Meteor.startup(function(){
    Session.set("is_sorting_by_score", true);
  });

  Template.leaderboard.players = function () {
    return Players.find({}, {sort: Session.get("is_sorting_by_score") ?
      {score: -1, name: 1} : {name: 1}});
  };

  Template.leaderboard.selected_name = function () {
    var player = Players.findOne(Session.get("selected_player"));
    return player && player.name;
  };

  Template.leaderboard.next_sort_by_field = function () {
    return (Session.get("is_sorting_by_score") ?
      "Sort by name" : "Sort by score");
  };

  Template.leaderboard.current_sort_by_field = function () {
    return (Session.get("is_sorting_by_score") ?
      "score" : "name");
  };

  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

  Template.leaderboard.events = {
    'click input.sort_by': function(){
        Session.set("is_sorting_by_score",
        !Session.get("is_sorting_by_score"));
    },
    'click input.inc': function () {
      Players.update(Session.get("selected_player"), {$inc: {score: 5}});
    }
  };

  Template.player.events = {
    'click': function () {
      Session.set("selected_player", this._id);
    }
  };
}

// On server startup, create some players if the database is empty.
if (Meteor.is_server) {
  Meteor.startup(function () {
    if (Players.find().count() === 0) {
      var names = ["Ada Lovelace",
                   "Grace Hopper",
                   "Marie Curie",
                   "Carl Friedrich Gauss",
                   "Nikola Tesla",
                   "Claude Shannon"];
      for (var i = 0; i < names.length; i++)
        Players.insert({name: names[i], score: Math.floor(Math.random()*10)*5});
    }
  });
}
