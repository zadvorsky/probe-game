//=require ../bower_components/three.js/build/three.js
//=require ../bower_components/p2js/build/p2.js

//=require init.js
//=require utils.js
//=require config.js
//=require objects/GameObject.js
//=require objects/*.js
//=require controllers/*.js

GAME.Engine = function(container) {
  // renderer
  this.container = container;
  this.initRenderer();

  // scene
  this.scene = new THREE.Scene();

  // camera
  this.cameras = {};
  this.registerCamera('probe', new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 10000));
  this.activateCamera('probe');

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

  // tick/update/render
  this.paused = false;

  this.tick = this.tick.bind(this);
  this.tick();
};

GAME.Engine.prototype.initRenderer = function() {
  var pixelRatio = window.devicePixelRatio;
  var antialias = (pixelRatio === 1);

  this.renderer = new THREE.WebGLRenderer({antialias: antialias});
  this.renderer.setPixelRatio(pixelRatio);

  this.container.appendChild(this.renderer.domElement);
};

GAME.Engine.prototype.initProbe = function() {
  this.probe = new GAME.Probe();
  this.add(this.probe);

  this.probe.setCamera(this.cameras['probe']);

  this.inputController = new GAME.InputController(this.probe);
};

GAME.Engine.prototype.reset = function() {
  this.probe.reset();
};

GAME.Engine.prototype.resize = function() {
  var width = window.innerWidth;
  var height = window.innerHeight;

  for (var key in this.cameras) {
    var camera = this.cameras[key];
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  this.renderer.setSize(width, height);
};

GAME.Engine.prototype.tick = function() {
  this.update();
  this.render();

  requestAnimationFrame(this.tick);
};

// todo add states?
// - paused/idle (editor default?)
// - play

GAME.Engine.prototype.update = function() {
  if (this.paused === true) return;

  this.world.step(1/60);
  this.inputController.update();

  this.scene.traverse(function(child) {
    child.update && child.update();
  });
};

GAME.Engine.prototype.render = function() {
  this.renderer.render(this.scene, this.activeCamera);
};

GAME.Engine.prototype.registerCamera = function(key, camera) {
  this.cameras[key] = camera;
};
GAME.Engine.prototype.activateCamera = function(key) {
  this.activeCamera = this.cameras[key];
};

GAME.Engine.prototype.add = function(object) {
  this.scene.add(object);
  object.body && this.world.addBody(object.body);
};
GAME.Engine.prototype.remove = function(object) {
  this.scene.remove(object);
  object.body && this.world.removeBody(object.body);
};



GAME.Engine.prototype.loadLevel = function(file, onComplete) {};
GAME.Engine.prototype.createAsteroid = function(def) {};
