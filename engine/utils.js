GAME.utils = {
  extend: function(Class, Base) {
    Class.prototype = Object.create(Base.prototype);
    Class.prototype.constructor = Class;
  }
};
