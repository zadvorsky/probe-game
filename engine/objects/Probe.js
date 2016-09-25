ENGINE.Probe = function() {
  // model
  var geometry = new THREE.SphereGeometry(1.0, 12, 12);
  geometry.rotateX(Math.PI * 0.5);
  //var geometry = new THREE.DodecahedronGeometry(1.0);
  //var material = new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: true});
  var material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x111111,
    metalness: 0.0,
    shading: THREE.FlatShading
  });

  // physics
  var shape = new p2.Circle({
    radius: 1.0,
    collisionGroup: ENGINE.COLLISION_GROUPS.PROBE,
    collisionMask:
      ENGINE.COLLISION_GROUPS.ASTEROID |
      ENGINE.COLLISION_GROUPS.BEACON |
      ENGINE.COLLISION_GROUPS.TARGET
  });
  var body = new p2.Body({
    mass: 1.0,
    damping: 0.0
  });
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
  
  // target
  this.overlappingTarget = null;
  
  this.addScript(function() {
    if (this.overlappingTarget) {
      var p = this.body.position;
      var t = this.overlappingTarget.body.position;
      var m = ENGINE.Target.size - 2.5;
      
      var onTarget = false;
      var onSpeed = false;
      
      if (p[0] > t[0] - m &&
          p[0] < t[0] + m &&
          p[1] > t[1] - m &&
          p[1] < t[1] + m ) {
        
        onTarget = true;
  
        var vel = p2.vec2.length(this.body.velocity);
        
        if (vel < 0.25) {
          onSpeed = true;
        }
        
        console.log('PROBE OVERLAPPED TARGET', onTarget, onSpeed);
      }
    }
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
  this.overlappingTarget = null;
};

Object.defineProperty(ENGINE.Probe.prototype, 'angularDamping', {
  get: function() {
    return this.body.angularDamping
  },
  set: function(v) {
    this.body.angularDamping = v;
  }
});

