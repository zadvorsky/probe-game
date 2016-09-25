ENGINE.Target = function(position) {
  var body = new p2.Body({
    mass: 0,
    position: [position.x, position.y]
  });
  body.addShape(new p2.Box({
    width: ENGINE.Target.size,
    height: ENGINE.Target.size,
    sensor: true,
    collisionGroup: ENGINE.COLLISION_GROUPS.TARGET,
    collisionMask: ENGINE.COLLISION_GROUPS.PROBE
  }));
  
  ENGINE.GameObject.call(this, ENGINE.Target.geometry, ENGINE.Target.material, body, 'target');
  
  this.castShadow = false;
  this.receiveShadow = false;
};
ENGINE.utils.extend(ENGINE.Target, ENGINE.GameObject);

ENGINE.Target.prototype.toJSON = function() {
  return {
    type: 'target',
    position: this.position
  }
};

// STATIC

// todo move radius to config or somewhere else?
ENGINE.Target.size = 3.0;
ENGINE.Target.material = new THREE.MeshBasicMaterial({
  color: 0x0000ff
});
ENGINE.Target.geometry = new THREE.PlaneGeometry(ENGINE.Target.size, ENGINE.Target.size);
