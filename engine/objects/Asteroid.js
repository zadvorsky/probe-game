ENGINE.Asteroid = function(geometry, material, body) {
  ENGINE.GameObject.call(this, geometry, material, body, 'asteroid');

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
