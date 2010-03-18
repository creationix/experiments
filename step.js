// Inspired by http://github.com/willconant/flow-js
function Step() {
  var steps = Array.prototype.slice.call(arguments);
  var counter;
  var results;
  
  function next(result) {
    if (steps.length <= 0) { return; }
    var fn = steps.shift();
    counter = 0;
    results = [];
    fn.apply(next, result);
  }
  next.parallel = function () {
    counter++;
    return function () {
      counter--;
      results.push(arguments);
      if (counter <= 0) {
        next(results);
      }
    }
  };
  
  next([]);
}
module.exports = Step;