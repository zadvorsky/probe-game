ENGINE.Asteroid = function(geometry, material, body) {
  ENGINE.GameObject.call(this, geometry, material, body, 'asteroid');

  this.body.shapes.forEach(function(shape) {
    shape.collisionGroup = ENGINE.COLLISION_GROUPS.ASTEROID;
    shape.collisionMask = ENGINE.COLLISION_GROUPS.PROBE | ENGINE.COLLISION_GROUPS.ASTEROID;
  });

  this.body.damping = 0.0;
  this.castShadow = true;
  this.receiveShadow = true;
};
ENGINE.utils.extend(ENGINE.Asteroid, ENGINE.GameObject);

ENGINE.Asteroid.prototype.toJSON = function() {
  return {
    type: 'asteroid',
    geometry: this.geometry.toJSON(),
    material: this.material.toJSON(),
    body: ENGINE.utils.bodyToJSON(this.body)
  };
};
