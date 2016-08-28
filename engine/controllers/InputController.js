ENGINE.InputController = function(probe) {
  this.probe = probe;
  this.enabled = true;

  var direction = this.direction = [0, 0];

  // up = 38
  // right = 39
  // down = 40
  // left = 37
  window.addEventListener('keydown', function(e) {
    switch (e.keyCode) {
      case 38:
        direction[1] = 1;
        break;
      case 40:
        direction[1] = -1;
        break;
      case 39:
        direction[0] = 1;
        break;
      case 37:
        direction[0] = -1;
    }
  });

  window.addEventListener('keyup', function(e) {
    switch (e.keyCode) {
      case 38:
      case 40:
        direction[1] = 0;
        break;
      case 39:
      case 37:
        direction[0] = 0;
        break;
    }
  });
};
ENGINE.InputController.prototype.update = function() {
  this.probe.setThrusterDirection(this.direction);
};
