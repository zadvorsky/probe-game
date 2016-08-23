GAME.GameObject = function(geometry, material, body) {
  THREE.Mesh.call(this, geometry, material);

  this.body = body;
};
GAME.utils.extend(GAME.GameObject, THREE.Mesh);

GAME.GameObject.prototype.update = function() {
  this.position.x = this.body.position[0];
  this.position.y = this.body.position[1];
  this.rotation.z = this.body.angle;
};
