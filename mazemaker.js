#!/usr/local/bin/node

Array.prototype.shuffle = function () {
  var i, j, tempi, tempj;
  i = this.length;
  if ( i === 0 ) {
    return false;
  }
  while ( --i ) {
    j = Math.floor( Math.random() * ( i + 1 ) );
    tempi = this[i];
    tempj = this[j];
    this[i] = tempj;
    this[j] = tempi;
  }
};

Number.prototype.times = function (fn) {
  for (var i = 0; i < this; i += 1) {
    fn(i);
  }
};

var Maze;

(function () {
  
  function get_root(node) {
    if (node.parent) {
      return get_root(node.parent);
    }
    return node;
  }

  function check_wall(first, second) {
    var first_root, second_root;
    first_root = get_root(first);
    second_root = get_root(second);
    if (first_root === second_root) {
      return true;
    }
    first_root.parent = second_root;
    return false;
  }

  Maze = function (width, height) {
    var sets = [];
    var order = [];
    for (var i = 0; i < width * height; i += 1) {
      sets.push({});
      order.push(i * 2);
      order.push(i * 2 + 1);
    }
    order.shuffle();

    order.forEach(function (i) {
      var first, second;
      if (i >= sets.length) {
        // Right Wall
        first = sets[i - sets.length];
        if (i % width === width - 1) {
          first.right = true;
          // Skip right wall for last column of cells
          return;
        }
        second = sets[i - sets.length + 1];
        first.right = check_wall(first, second);
      } else {
        // Bottom Wall
        first = sets[i];
        if (Math.floor(i / width) === height - 1) {
          first.bottom = true;
          // Skip bottom wall for last row of cells
          return;
        }
        second = sets[i + width];
        first.bottom = check_wall(first, second);
      }
    });

    this.width = width;
    this.height = height;
    this.sets = sets;
  }
  
  Maze.prototype.display = function () {
    var x, y, map, item, grid, line;
    grid = [];
    map = "██";
    line = [1];
    for (x  = 0; x < this.width; x += 1) {
      map += "████";
      line.push(1);
      line.push(1);
    }
    grid.push(line);
    for (y = 0; y < this.height; y += 1) {
      map += "\n██";
      line = [1];
      for (x = 0; x < this.width; x += 1) {
        item = this.sets[y * this.width + x];
        map += item.right ? "  ██" : "    ";
        line.push(0);
        line.push(item.right ? 1 : 0);
      }
      grid.push(line);
      map += "\n██";
      line = [1];
      for (x = 0; x < this.width; x += 1) {
        item = this.sets[y * this.width + x];
        var itemr = this.sets[y * this.width + x + 1];
        var itemb = this.sets[y * this.width + x + this.width];
        map += item.bottom ? "██" : "  ";
        line.push(item.bottom ? 1 : 0);
        map += (item.right || item.bottom || itemr.bottom || itemb.right)  ? "██" : "  ";
        line.push((item.right || item.bottom || itemr.bottom || itemb.right) ? 1 : 0);
      }
      grid.push(line);
    }
    map += "\n";
    // sys.p(grid);
    return map;
  };

}());
if (__filename === process.ARGV[1]) {
  var sys = require('sys');
  var width, height;
  // Check that there are two extra arguments and that they are both non-zero numbers
  if (process.ARGV.length == 4 && (width = parseInt(process.ARGV[2])) && (height = parseInt(process.ARGV[3]))) {
    sys.print((new Maze(width, height)).display());
  } else {
    sys.puts("USAGE:\n\t" + process.ARGV[1] + " width height")
  }
}


// Sample output for a 5x5 maze
// ██████████████████████
// ██  ██              ██
// ██  ██████  ██  ██████
// ██          ██      ██
// ██  ██████  ██  ██████
// ██      ██  ██      ██
// ██  ██████████████  ██
// ██      ██          ██
// ██  ██████  ██████  ██
// ██      ██      ██  ██
// ██████████████████████

