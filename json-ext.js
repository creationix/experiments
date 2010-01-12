// Add ruby-like JSON ability to the standard JSON code.
(function () {

  // A recursive function that traverses the raw object looking for special
  // serialized objects to be de-serialized.  Used by `JSON.load`
  var json_object_load = function (obj) {
    var key;
    if (typeof obj.json_class === 'string') {
      return (eval(obj.json_class)).jsonCreate(obj);
    }
    if (typeof obj === 'object') {
      for (key in obj) {
        obj[key] = json_object_load(obj[key]);
      }
    }
    return obj;
  };

  // dump is just an alias of stringify since the needed `toJSON` hook is 
  // already in the stringify implementation.
  JSON.dump = JSON.stringify;
  
  // Works like JSON.parse, but then filters the output looking for object
  // hooks.  Allows custom objects to be de-serialized.
  JSON.load = function (text) { return json_object_load(JSON.parse(text)); };
  
  // Adds generic object hooks to about any object constructor.
  JSON.extend = function (class) {

    // Unserializes an object from JSON
    class.jsonCreate = function(o) {
      var obj, data, O, prototype;
      O = function () {};
      obj = new O();
      prototype = class.prototype;
      for (key in prototype) {
        if (prototype.hasOwnProperty(key)) {
          O.prototype[key] = prototype[key];
        }
      }
      O.name = class.name;
      obj.constructor = class;
      data = o.data;
      for (key in data) {
        if (data.hasOwnProperty(key)) {
          obj[key] = data[key];
        }
      }
      return obj;
    };

    // Serialize any object to JSON
    class.prototype.toJSON = function() {
      var data = {};
      if (this.constructor.name === 'Object') {
        return this;
      }
      for (key in this) {
        if (this.hasOwnProperty(key) && typeof this[key] !== 'function') {
          data[key] = this[key];
        }
      }
      return {
        'json_class': this.constructor.name,
        'data': data
      };
    };
  };


}());