
// Add some ruby-like methods to some of the builtins
Object.prototype.instance_eval = function (block) {
  // Convert the function to a string so that we can rebind it
  if (typeof block === 'function') {
    block = "(" + block + ").call(this)";
  }
  // Eval using "this" as the "with" scope
  return eval("with(this) { " + block + "}");
};
Object.prototype.keys = function () {
  var key, keys = [];
  for (key in this) {
    if (this.hasOwnProperty(key)) {
      keys.push(key);
    }
  }
  return keys;
};
Number.prototype.times = function (block) {
  for (var i = 0; i < this; i += 1) {
    block(i);
  }
};
Number.prototype.is_even = function () {
  return (this % 2) === 0;
};
Number.prototype.upto = function (other, block) {
  for (var i = this; i <= other; i+= 1) {
    block(i);
  }
};
Array.prototype.minmax = function () {
  var min, max;
  this.forEach(function (item) {
    if (min === undefined || item < min) {
      min = item;
    }
    if (max === undefined || item > max) {
      max = item;
    }
  });
  return [min, max];
};

function Turtle() {
  // directions: 0 = E, 1 = S, 2 = W, 3 = N
  // axis: 0 = x, 1 = y
  this.board = {};
  this.x = 0;
  this.y = 0;
  this.direction = 0;
  this.pen_up();
}
Turtle.prototype = {
  pen_up: function () {
    this.is_pen_down = false;
  },
  pen_down: function () {
    this.is_pen_down = true;
    this.mark_current_location();
  },
  forward: function (n) {
    with(this) {
      if (n === undefined) {
        n = 1;
      }
      n.times(function () {
        move();
      });
    }
  },
  left: function () {
    this.direction -= 1;
    if (this.direction < 0) {
      this.direction = 3;
    }
  },
  right: function () {
    this.direction += 1;
    if (this.direction > 3) {
      this.direction = 0;
    }
  },
  walk: function (block) {
    this.instance_eval(block);
  },
  draw: function () {
    var xrange, yrange,
      puts = require('sys').puts;
    with (this) {
      xrange = board.keys().map(function (key) {
        return parseInt(key.split(',')[0]);
      }).minmax();
      yrange = board.keys().map(function (key) {
        return parseInt(key.split(',')[1]);
      }).minmax();
      yrange[0].upto(yrange[1], function (y) {
        var row = "";
        xrange[0].upto(xrange[1], function (x) {
          row += board[[x,y]] || " ";
        });
        puts(row);
      });
    }
  },
  move: function () {
    var increment = this.direction > 1 ? -1 : 1;
    if (this.direction.is_even()) {
      this.x += increment;
    } else {
      this.y += increment;
    }
    this.mark_current_location();
  },
  mark_current_location: function () {
    if (this.is_pen_down) {
      this.board[[this.x, this.y]] = "#";
    }
  }
};


// Use the dsl (Domain Specific Language)
var turtle = new Turtle();

turtle.walk(function () {
  pen_down();
  left();
  forward(4);
  right();
  (4).times(function () {
    forward(1);
    right();
    forward(1);
    left();
  });
  left();
  forward(4);
  right();
  pen_up();
  forward(4);
  pen_down();
  (4).times(function () {
    forward(4);
    right();
  });
  pen_up();
  forward(8);
  pen_down();
  forward(3);
  right();
  forward(1);
  left();
  forward(1);
  right();
  forward(2);
  right();
  forward(1);
  left();
  forward(1);
  right();
  forward(3);
  right();
  forward(4);
  right();
  pen_up();
  // E
  forward(12);
  right();
  right();
  pen_down();
  forward(4);
  left();
  forward(4);
  left();
  forward(4);
  pen_up();
  left();
  forward(2);
  left();
  forward(1);
  pen_down();
  forward(3);
  
});

turtle.draw();

// Here's the output if you don't have node

// Timothy-Caswells-MacBook-Pro:Desktop tim$ node turtle.js 
// #####   #####   #####
// #   #   #   #   #   #
// #   #   #   #   #   #
// #   #   #   #   #   #
// #####   #####   #####