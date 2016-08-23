GAME.Probe = function() {

  // THREE

  var geometry = new THREE.SphereGeometry(1.0, 16, 16);
  var material = new THREE.MeshBasicMaterial({color: 0xffffff});

  // PHYSICS

  var shape = new p2.Circle({
    radius: 1.0
  });
  var body = new p2.Body({
    mass: 1.0
  });
  body.addShape(shape);

  GAME.GameObject.call(this, geometry, material, body);

  // THRUSTERS

  var thrusterPower = 1.0;
  var force = [0, 0];

  this.thrusterDirection = [0, 0];

  this.addScript(function() {
    force[0] = this.thrusterDirection[0] * thrusterPower;
    force[1] = this.thrusterDirection[1] * thrusterPower;

    this.body.applyForce(force)
  }, 1);
};
GAME.utils.extend(GAME.Probe, GAME.GameObject);

GAME.Probe.prototype.setThrusterDirection = function(t) {
  this.thrusterDirection[0] = t[0];
  this.thrusterDirection[1] = t[1];
};
