GAME.InputController = function(probe) {
  this.probe = probe;
  this.enabled = true;

  var force = this.force = [0, 0];
  var thrust = 1.0;

  // up = 38
  // right = 39
  // down = 40
  // left = 37

  window.addEventListener('keydown', function(e) {
    switch (e.keyCode) {
      case 38:
        force[1] = thrust;
        break;
      case 40:
        force[1] = -thrust;
        break;
      case 39:
        force[0] = thrust;
        break;
      case 37:
        force[0] = -thrust;
    }
  });

  window.addEventListener('keyup', function(e) {
    switch (e.keyCode) {
      case 38:
      case 40:
        force[1] = 0;
        break;
      case 39:
      case 37:
        force[0] = 0;
        break;
    }
  });

};
GAME.InputController.prototype.update = function() {
  this.probe.body.applyForce(this.force);
};
