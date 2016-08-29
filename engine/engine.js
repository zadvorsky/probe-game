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



ENGINE.Engine.prototype.parseLevelJSON = function(json) {
  // asteroids
  json.asteroids.forEach(function(data) {
    var asteroid = this.createAsteroid(data);
    this.add(asteroid);
  }.bind(this));
};
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

  // 4. calculate center

  geometry.computeBoundingBox();

  var geometryCenter = geometry.boundingBox.center();

  geometry.center();

  // MATERIAL
  
  var material = new THREE.MeshStandardMaterial(config.material);

  // test material
  //var material = new THREE.MeshBasicMaterial({
  //  wireframe: true,
  //  color: 0x00ffff,
  //  transparent: true,
  //  opacity: 0.1
  //});
  
  // BODY
  
  var contour = [];
  
  geometry.vertices.forEach(function(v) {
    if (v.z === 0) contour.push([v.x, v.y]);
  });

  // swap first and second point because default order is wrong
  var temp = contour[0];
  contour[0] = contour[1];
  contour[1] = temp;

  var body = new p2.Body({
    mass: 10,
    position: [geometryCenter.x, geometryCenter.y]
  });
  
  if (!body.fromPolygon(contour)) {
    console.log('error generating p2.shapes');
  }

  // ASTEROID
  
  var asteroid = new ENGINE.GameObject(geometry, material, body);
  asteroid.position.copy(geometryCenter);
  asteroid.castShadow = true;
  asteroid.receiveShadow = true;

  // adjust asteroid geometry to match with the p2 body
  // TODO figure out why geometry and body do not match
  // TODO simplify calculation
  var aabb = body.getAABB();
  var bodyBox = new THREE.Box3(
    new THREE.Vector3(aabb.lowerBound[0] - body.position[0], aabb.lowerBound[1] - body.position[1]),
    new THREE.Vector3(aabb.upperBound[0] - body.position[0], aabb.upperBound[1] - body.position[1])
  );
  var offset = new THREE.Vector3().subVectors(bodyBox.min, geometry.boundingBox.min);

  geometry.translate(offset.x, offset.y, 0);

  // body shapes debug geometry
  //for (i = 0; i < body.shapes.length; i++) {
  //  var g = new THREE.Geometry();
  //  var s = body.shapes[i];
  //
  //  g.vertices = s.vertices.map(function(v) {
  //    return new THREE.Vector3(v[0], v[1], 0);
  //  });
  //
  //  var hullLine = new THREE.Line(g, new THREE.LineBasicMaterial({color:0xff00ff}));
  //  hullLine.position.x = s.position[0];
  //  hullLine.position.y = s.position[1];
  //  asteroid.add(hullLine);
  //
  //  hullLine.add(new THREE.Mesh(
  //    new THREE.CircleGeometry(0.1, 4),
  //    new THREE.MeshBasicMaterial({
  //      color: 0xff00ff
  //    })
  //  ));
  //}

  // update to align body and mesh
  asteroid.update();

  return asteroid;
};
