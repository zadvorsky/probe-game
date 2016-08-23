//=require ../bower_components/three.js/build/three.js
//=require ../bower_components/three.js/examples/js/controls/OrbitControls.js
//=require ../bower_components/p2js/build/p2.js

//=require init.js
//=require utils.js
//=require three.root.js
//=require objects/GameObject.js
//=require objects/*.js
//=require controllers/*.js

GAME.Engine = function() {
  var root = new GAME.Root();

  root.camera.position.z = 20;
  root.add(new THREE.AxisHelper(10));

  var world = new p2.World({
    gravity: [0, 0]
  });

  var probe = new GAME.Probe();

  root.add(probe, 'probe');
  world.addBody(probe.body);

  var inputController = new GAME.InputController(probe);

  root.addUpdateCallback(function() {
    inputController.update();
    world.step(1/60);
  });
};
GAME.Engine.prototype.loadLevel = function(file, onComplete) {
  // clear
  // parse json
  // (load models)
  // callback
};
GAME.Engine.prototype.createAsteroid = function(def) {

};
