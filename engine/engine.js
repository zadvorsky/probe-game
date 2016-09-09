//=require ../bower_components/three.js/build/three.js
//=require ../bower_components/p2js/build/p2.js

//=require init.js
//=require utils.js
//=require config.js
//=require objects/GameObject.js
//=require objects/*.js
//=require controllers/*.js

// STATIC
ENGINE.COLLISION_GROUPS = {
  ASTEROID: Math.pow(2, 0),
  PROBE: Math.pow(2, 1),
  BEACON: Math.pow(2, 1)
};
ENGINE.COLLISION_MATERIALS = {

};

ENGINE.Engine = function(container) {
  // renderer
  this.container = container;
  this.initRenderer();

  // scene
  this.scene = new THREE.Scene();

  // camera
  this.cameras = {};
  this.registerCamera('game', new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 10000));
  this.activateCamera('game');

  // physics
  this.world = new p2.World({
    gravity: [0, 0]
  });

  // todo add CollisionMaterials

  this.world.on("beginContact", this.handleBeginContact.bind(this));

  // lights
  //this.directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.125);
  //this.directionalLight1.position.set(0, 0, 1);
  //this.scene.add(this.directionalLight1);

  // loaders
  this.geometryLoader = new THREE.JSONLoader();
  this.materialLoader = new THREE.MaterialLoader();

  // objects
  this.initProbe();
  this.gameObjects = [];

  // tick/update/render
  this.paused = false;

  this.tick = this.tick.bind(this);
  this.tick();

  // resize
  this.resize = this.resize.bind(this);
  this.resize();
  window.addEventListener('resize', this.resize, false);
};

ENGINE.Engine.prototype.initRenderer = function() {
  var pixelRatio = window.devicePixelRatio;
  var antialias = (pixelRatio === 1);

  this.renderer = new THREE.WebGLRenderer({antialias: antialias});
  this.renderer.setPixelRatio(pixelRatio);
  this.renderer.setClearColor(0x000000);

  this.renderer.shadowMap.enabled = true;
  this.renderer.shadowMap.type = THREE.BasicShadowMap;
  //this.renderer.shadowMap.type = THREE.PCFShadowMap;
  //this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  this.container.appendChild(this.renderer.domElement);
};
ENGINE.Engine.prototype.initProbe = function() {
  this.probe = new ENGINE.Probe();
  this.add(this.probe, false);

  this.probe.setCamera(this.cameras['game']);

  this.inputController = new ENGINE.InputController(this.probe);
};

/**
 * collisions:
 * probe <-> beacon
 * probe <-> asteroid
 * probe <-> target
 * asteroid <-> asteroid
 */
ENGINE.Engine.prototype.handleBeginContact = function(e) {
  var bodyA = e.bodyA;
  var bodyB = e.bodyB;

  console.log('HANDLE BEGIN CONTACT', e);

  if ((bodyA.gameObject.gType === 'asteroid' && bodyB.gameObject.gType === 'asteroid')) {
    console.log('asteroid asteroid');
  }
  else {
    var probeBody = (bodyA.gameObject.gType === 'probe') ? bodyA : bodyB;
    var otherBody = (probeBody === bodyA) ? bodyB : bodyA;

    switch (otherBody.gameObject.gType) {
      case 'asteroid':
        console.log('probe asteroid');
        break;
      case 'beacon':
        console.log('probe beacon');
        this.remove(otherBody.gameObject);
        break;
      default:
        console.log('UNHANDLED COLLISION', bodyA.gameObject.gType, bodyB.gameObject.gType);
        break;
    }
  }
};

ENGINE.Engine.prototype.tick = function() {
  this.update();
  this.render();

  requestAnimationFrame(this.tick);
};
ENGINE.Engine.prototype.update = function(force) {
  if (this.paused === true && force !== true) return;

  this.world.step(1/60);
  this.inputController.update();

  this.scene.traverse(function(child) {
    // todo remove update.length check
    (child.update && child.update.length == 0) && child.update();
  });
};
ENGINE.Engine.prototype.render = function() {
  this.renderer.render(this.scene, this.activeCamera);
};

ENGINE.Engine.prototype.resize = function() {
  var width = window.innerWidth;
  var height = window.innerHeight;

  for (var key in this.cameras) {
    var camera = this.cameras[key];
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  this.renderer.setSize(width, height);
};

ENGINE.Engine.prototype.registerCamera = function(key, camera) {
  this.cameras[key] = camera;
};
ENGINE.Engine.prototype.activateCamera = function(key) {
  this.activeCamera = this.cameras[key];
};

// todo find better way to handle gameObjects array
ENGINE.Engine.prototype.add = function(object, addToGameObjects) {
  this.scene.add(object);
  object.body && this.world.addBody(object.body);
  (addToGameObjects !== false) && this.gameObjects.push(object);
};
ENGINE.Engine.prototype.remove = function(object, removeFromGameObjects) {
  this.scene.remove(object);
  object.body && this.world.removeBody(object.body);

  if (removeFromGameObjects !== false) {
    var index = this.gameObjects.indexOf(object);
    if (index !== -1) this.gameObjects.splice(index, 1);
  }
};

ENGINE.Engine.prototype.clear = function() {
  this.gameObjects.forEach(function(a) {
    this.remove(a, false);
  }.bind(this));
  this.gameObjects.length = 0;
};
ENGINE.Engine.prototype.reset = function() {
  this.probe.reset();
  this.clear();
};

ENGINE.Engine.prototype.parseLevelJSON = function(json) {
  json.objects.forEach(function(obj) {
    switch (obj.type) {
      case 'asteroid':
        this.createAsteroid(obj);
        break;
      case 'beacon':
        this.createBeacon(obj);
        break;
    }
  }.bind(this));
};
ENGINE.Engine.prototype.createAsteroid = function(data) {
  var geometry = this.geometryLoader.parse(data.geometry.data).geometry;
  var material = this.materialLoader.parse(data.material);
  var body = ENGINE.utils.bodyFromJSON(data.body);
  var asteroid = new ENGINE.Asteroid(geometry, material, body);

  this.add(asteroid);
};
ENGINE.Engine.prototype.createBeacon = function(data) {
  var beacon = new ENGINE.Beacon(data.position);

  this.add(beacon);
};
