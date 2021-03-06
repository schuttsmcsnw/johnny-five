var Change, five, temporal;

Change = require("../eg/change.js");
five = require("../lib/johnny-five.js");
temporal = require("temporal");

new five.Boards([ "control", "nodebot" ]).on("ready", function(boards) {


  var controllers, changes, nodebot, whiskers, opposing, directions;

  controllers = {
    x: new five.Sensor({
      board: boards.controller,
      pin: "I0"
    }),
    y: new five.Sensor({
      board: boards.controller,
      pin: "I1"
    })
  };

  nodebot = new five.Nodebot({
    board: boards.nodebot,
    right: 10,
    left: 11
  });

  whiskers = {
    left: new five.Pin({
      board: boards.nodebot,
      addr: 5,
    }),
    right: new five.Pin({
      board: boards.nodebot,
      addr: 7
    }),
  };

  changes = {
    x: new Change(),
    y: new Change()
  };

  opposing = {
    left: "right",
    right: "left"
  };

  directions = {
    x: {
      1: "left",
      3: "right"
    },
    y: {
      1: "rev",
      3: "fwd"
    }
  };

  [ "left", "right" ].forEach(function( impact ) {
    whiskers[ impact ].on("high", function() {
      var turn = opposing[ impact ];

      console.log(
        "%s impact, turning %s",
        impact.toUpperCase(),
        turn.toUpperCase()
      );

      nodebot[ turn ]();
    });
  });



  [ "x", "y" ].forEach(function( axis ) {
    controllers[ axis ].scale(1, 3).on("change", function() {
      var round = Math.round( this.value );

      if ( round !== 2 && changes[ axis ].isNoticeable( round ) ) {
        console.log( "%s changed noticeably (%d)", axis,  round);

        nodebot[ directions[ axis ][ round ] ]();

      } else {
        changes[ axis ].last = round;
      }
    });
  });

  boards.control.repl.inject({
    n: nodebot
  });

});
