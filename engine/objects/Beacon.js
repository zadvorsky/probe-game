ENGINE.Beacon = function(position) {

  var body = new p2.Body({
    mass: 0,
    position: [position.x, position.y]
  });
  body.addShape(new p2.Circle({
    radius: 0.5,
    sensor: true
  }));

  ENGINE.GameObject.call(this, ENGINE.Beacon.geometry, ENGINE.Beacon.material, body, 'beacon');

  this.castShadow = false;
  this.receiveShadow = false;
};
ENGINE.utils.extend(ENGINE.Beacon, ENGINE.GameObject);

ENGINE.Beacon.prototype.toJSON = function() {
  return {
    type: 'beacon',
    position: this.position
  }
};

// STATIC

ENGINE.Beacon.material = new THREE.MeshBasicMaterial({
  color: 0x00ff00
});
ENGINE.Beacon.geometry = new THREE.CircleGeometry(0.5, 16);
