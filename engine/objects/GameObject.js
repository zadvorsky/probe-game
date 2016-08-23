GAME.GameObject = function(geometry, material, body) {
  THREE.Mesh.call(this, geometry, material);

  this.body = body;
  this.scripts = [];

  this.addScript(function() {
    this.position.x = this.body.position[0];
    this.position.y = this.body.position[1];
    this.rotation.z = this.body.angle;
  });
};
GAME.utils.extend(GAME.GameObject, THREE.Mesh);

GAME.GameObject.prototype.update = function() {
  var object = this;
  this.scripts.forEach(function(s) {
    s.script.apply(object);
  })
};

GAME.GameObject.prototype.addScript = function(script, priority) {
  this.scripts.push({script: script, priority: priority || 0});
  this.scripts.sort(function(a, b) {
    return a.priority < b.priority;
  })
};
