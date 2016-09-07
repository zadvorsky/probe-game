ENGINE.Probe = function() {
  // model
  var geometry = new THREE.SphereGeometry(1.0, 12, 12);
  geometry.rotateX(Math.PI * 0.5);
  //var geometry = new THREE.DodecahedronGeometry(1.0);
  //var material = new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: true});
  var material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.0,
    shading: THREE.FlatShading
  });

  // physics
  var shape = new p2.Circle({radius: 1.0});
  var body = new p2.Body({mass: 1.0});
  body.addShape(shape);

  ENGINE.GameObject.call(this, geometry, material, body, 'probe');

  // config
  this.thrusterPower = ENGINE.config.probe.thrusterPower;
  this.cameraDistanceDefault = ENGINE.config.probe.cameraDistanceDefault;
  this.cameraDistanceSpeedFactor = ENGINE.config.probe.cameraDistanceSpeedFactor;
  this.angularDamping = ENGINE.config.probe.angularDamping;

  // light
  var light = new THREE.PointLight(0xffffff, 1, 30);
  light.position.z = 0;
  light.castShadow = true;
  light.shadow.camera.near = 0.1;
  light.shadow.camera.far = 30;
  light.shadow.bias = 0.01;
  this.add(light);
  this.castShadow = false;
  this.receiveShadow = false;

  // thrust
  this.thrusterDirection = [0, 0];

  var force = [0, 0];

  this.addScript(function() {
    force[0] = this.thrusterDirection[0] * this.thrusterPower;
    force[1] = this.thrusterDirection[1] * this.thrusterPower;

    this.body.applyForceLocal(force)
  }, 1);

  // camera
  this.addScript(function() {
    this.camera.position.z = this.cameraDistanceDefault + p2.vec2.length(this.body.velocity) * this.cameraDistanceSpeedFactor;
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

ENGINE.Probe.prototype.reset = function() {
  this.body.velocity[0] = this.body.position[0] = 0;
  this.body.velocity[1] = this.body.position[1] = 0;
  this.body.angle = 0;
  this.body.angularVelocity = 0;
};

Object.defineProperty(ENGINE.Probe.prototype, 'angularDamping', {
  get: function() {
    return this.body.angularDamping
  },
  set: function(v) {
    this.body.angularDamping = v;
  }
});

