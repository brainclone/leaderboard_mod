// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players."

Players = new Meteor.Collection("players");

Score_Range = 10;
Score_Unit = 5;

function random_score(range, unit) {
  return Math.floor(Math.random()*range)*unit;
}

if (Meteor.is_client) {
  function add_scientist() {
    name_to_add = $("#name_text").val();
    //console.log(name_to_add);
    if (name_to_add) {
      Players.insert({name: name_to_add, score: random_score(Score_Range, Score_Unit)});
    }
  }

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

    'click input.inc': function () {
      Players.update(Session.get("selected_player"), {$inc: {score: 5}});
    },

    'click input.add': add_scientist,

    'click input.del': function() {
      Players.remove(Session.get("selected_player"));
      Session.set("selected_player", '');
    },

    'click input.reset': function() {
      Players.find().forEach(function(player) {
        Players.update(player._id, {$set: {score: random_score(Score_Range, Score_Unit)}});
      }); 
    },

    'click input.sort_by': function() {
      Session.set("is_sorting_by_score",
      !Session.get("is_sorting_by_score"));
    }
  };

  Template.player.events = {
    'click': function () {
      Session.set("selected_player", this._id);
    }
  };

  $(document).keypress(function(e) {
    if(e.which == 13) { //"ENTER" key pressed;
      //alert('You pressed enter!');
      add_scientist();
    }
  });
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
        Players.insert({name: names[i], score: random_score(Score_Range, Score_Unit)});
    }
  });
}
