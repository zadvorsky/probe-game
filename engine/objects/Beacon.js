ENGINE.Beacon = function(position) {
  var body = new p2.Body({
    mass: 0,
    position: [position.x, position.y]
  });
  body.addShape(new p2.Circle({
    radius: ENGINE.Beacon.radius * 0.5,
    sensor: true,
    collisionGroup: ENGINE.COLLISION_GROUPS.BEACON,
    collisionMask: ENGINE.COLLISION_GROUPS.PROBE
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

// todo move radius to config or somewhere else?
ENGINE.Beacon.radius = 0.5;
ENGINE.Beacon.material = new THREE.MeshBasicMaterial({
  color: 0x00ff00
});
ENGINE.Beacon.geometry = new THREE.CircleGeometry(ENGINE.Beacon.radius, 16);
