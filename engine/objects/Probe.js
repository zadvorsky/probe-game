ENGINE.Probe = function() {

  // THREE

  var geometry = new THREE.SphereGeometry(1.0, 16, 16);
  var material = new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: true});

  // PHYSICS

  var shape = new p2.Circle({
    radius: 1.0
  });
  var body = new p2.Body({
    mass: 1.0,
    angularDamping: 0.25
  });
  body.addShape(shape);

  ENGINE.GameObject.call(this, geometry, material, body);

  // LIGHT

  var light = new THREE.PointLight(0xffffff, 1, 30);
  light.position.z = 0;
  light.castShadow = true;
  light.shadow.camera.near = 0.1;
  light.shadow.camera.far = 30;
  light.shadow.bias = 0.01;
  this.add(light);

  //this.add(new THREE.CameraHelper(light.shadow.camera));

  this.castShadow = false;
  this.receiveShadow = false;

  // THRUSTERS

  var thrusterPower = 1.0;
  var force = [0, 0];

  this.thrusterDirection = [0, 0];

  this.addScript(function() {
    force[0] = this.thrusterDirection[0] * thrusterPower;
    force[1] = this.thrusterDirection[1] * thrusterPower;

    this.body.applyForceLocal(force)
  }, 1);
};
ENGINE.utils.extend(ENGINE.Probe, ENGINE.GameObject);

ENGINE.Probe.prototype.setThrusterDirection = function(t) {
  this.thrusterDirection[0] = t[0];
  this.thrusterDirection[1] = t[1];
};

ENGINE.Probe.prototype.setCamera = function(camera) {
  this.camera = camera;
  this.camera.position.z = 10;
  this.add(camera);
};

ENGINE.Probe.prototype.reset = function(camera) {
  this.body.velocity[0] = this.body.position[0] = 0;
  this.body.velocity[1] = this.body.position[1] = 0;
  this.body.angle = 0;
  this.body.angularVelocity = 0;
};
