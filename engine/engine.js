//=require ../bower_components/three.js/build/three.js
//=require ../bower_components/p2js/build/p2.js

//=require init.js
//=require utils.js
//=require config.js
//=require objects/GameObject.js
//=require objects/*.js
//=require controllers/*.js

ENGINE.Engine = function(container) {
  // renderer
  this.container = container;
  this.initRenderer();

  // scene
  this.scene = new THREE.Scene();

  window.scene = this.scene;

  // camera
  this.cameras = {};
  this.registerCamera('game', new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 10000));
  this.activateCamera('game');

  // resize
  this.resize = this.resize.bind(this);
  this.resize();
  window.addEventListener('resize', this.resize, false);

  // physics
  this.world = new p2.World({
    gravity: [0, 0]
  });
  // todo init global materials, groups

  // objects
  this.initProbe();

  this.asteroids = [];
  
  // tick/update/render
  this.paused = false;

  this.tick = this.tick.bind(this);
  this.tick();
};

ENGINE.Engine.prototype.initRenderer = function() {
  var pixelRatio = window.devicePixelRatio;
  var antialias = (pixelRatio === 1);

  this.renderer = new THREE.WebGLRenderer({antialias: antialias});
  this.renderer.setPixelRatio(pixelRatio);
  this.renderer.setClearColor(0x111111);

  this.renderer.shadowMap.enabled = true;
  this.renderer.shadowMap.type = THREE.BasicShadowMap;
  //this.renderer.shadowMap.type = THREE.PCFShadowMap;
  //this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  this.container.appendChild(this.renderer.domElement);
};

ENGINE.Engine.prototype.initProbe = function() {
  this.probe = new ENGINE.Probe();
  this.add(this.probe);

  this.probe.setCamera(this.cameras['game']);

  this.inputController = new ENGINE.InputController(this.probe);
};

ENGINE.Engine.prototype.reset = function() {
  this.probe.reset();

  this.asteroids.forEach(function(a) {
    a.body.velocity[0] = 0;
    a.body.velocity[1] = 0;
    a.body.position[0] = a.userData.defaultPosition.x;
    a.body.position[1] = a.userData.defaultPosition.y;
    a.body.angle = 0;
    a.body.angularVelocity = 0;
  });
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

ENGINE.Engine.prototype.tick = function() {
  this.update();
  this.render();

  requestAnimationFrame(this.tick);
};

// todo add states?
// - paused/idle (editor default?)
// - play

ENGINE.Engine.prototype.update = function(force) {
  if (this.paused === true && force !== true) return;

  this.world.step(1/60);
  this.inputController.update();

  this.scene.traverse(function(child) {
    child.update && child.update();
  });
};

ENGINE.Engine.prototype.render = function() {
  this.renderer.render(this.scene, this.activeCamera);
};

ENGINE.Engine.prototype.registerCamera = function(key, camera) {
  this.cameras[key] = camera;
};
ENGINE.Engine.prototype.activateCamera = function(key) {
  this.activeCamera = this.cameras[key];
};

ENGINE.Engine.prototype.add = function(object) {
  this.scene.add(object);
  object.body && this.world.addBody(object.body);
};
ENGINE.Engine.prototype.remove = function(object) {
  this.scene.remove(object);
  object.body && this.world.removeBody(object.body);
};

ENGINE.Engine.prototype.clear = function() {
  // asteroids
  this.asteroids.forEach(function(a) {
    this.remove(a);
  }.bind(this));
  this.asteroids.length = 0;
};

ENGINE.Engine.prototype.parseLevelJSON = function(json) {
  var geometryLoader = new THREE.JSONLoader();
  var materialLoader = new THREE.MaterialLoader();

  json.asteroids.forEach(function(data) {
    var geometry = geometryLoader.parse(data.geometry.data).geometry;
    var material = materialLoader.parse(data.material);
    var body = ENGINE.utils.bodyFromJSON(data.body);
    var asteroid = new ENGINE.GameObject(geometry, material, body);

    asteroid.update();
    
    this.asteroids.push(asteroid);
    this.add(asteroid);
  }.bind(this));
};
ENGINE.Engine.prototype.createAsteroid = function(config) {

};
