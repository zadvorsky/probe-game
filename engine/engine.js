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

ENGINE.Engine.prototype.update = function() {
  if (this.paused === true) return;

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



ENGINE.Engine.prototype.loadLevel = function(file, onComplete) {};
ENGINE.Engine.prototype.createAsteroid = function(config) {
  // GEOMETRY
  
  // 1. create shape
  var shape = new THREE.Shape();
  shape.moveTo(config.points[0].x, config.points[0].y);
  
  for (var i = 1; i < config.points.length; i++) {
    shape.lineTo(config.points[i].x, config.points[i].y);
  }
  
  // 2. extrude shape
  var geometry = shape.extrude({
    amount: 0,
    bevelEnabled: true,
    bevelSegments: 1,
    steps: 1,
    bevelSize: 0,
    bevelThickness: config.extrudeDepth
  });
  
  // 3. subdivide shape
  new THREE.SubdivisionModifier(config.subdivisions).modify(geometry);
  
  // geometry.center();
  
  // MATERIAL
  
  // var material = new THREE.MeshStandardMaterial(config.material);
  var material = new THREE.MeshBasicMaterial({
    wireframe: true,
    color: 0x00ffff,
    transparent: true,
    opacity: 0.1,
    // visible: false
  });
  
  // BODY
  
  var hull = [];
  
  geometry.vertices.forEach(function(v) {
    if (v.z === 0) hull.push([v.x, v.y]);
  });
  
  var temp = hull[0];
  hull[0] = hull[1];
  hull[1] = temp;
  
  var body = new p2.Body({
    mass: 0,
    position: [config.position.x, config.position.y]
  });
  console.log(body.fromPolygon(hull));
  
  console.log(body);
  
  // ASTEROID
  
  var asteroid = new ENGINE.GameObject(geometry, material, body);
  asteroid.position.copy(config.position);
  
  for (i = 0; i < body.shapes.length; i++) {
    var g = new THREE.Geometry();
  
    g.vertices = body.shapes[i].vertices.map(function(v) {
      return new THREE.Vector3(v[0] + body.shapes[i].position[0], v[1] + body.shapes[i].position[1], 0);
    });
  
    var hullLine = new THREE.Line(g, new THREE.LineBasicMaterial({color:0xff00ff}));
    asteroid.add(hullLine);
  }
  
  return asteroid;
};
