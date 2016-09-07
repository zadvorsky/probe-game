ENGINE.GameObject = function(geometry, material, body, type) {
  THREE.Mesh.call(this, geometry, material);

  this.body = body;
  this.body.userData = {};
  this.scripts = [];
  this.engineType = type;

  this.addScript(function() {
    this.position.x = this.body.position[0];
    this.position.y = this.body.position[1];
    this.rotation.z = this.body.angle;
  });
};
ENGINE.utils.extend(ENGINE.GameObject, THREE.Mesh);

ENGINE.GameObject.prototype.update = function() {
  var object = this;
  this.scripts.forEach(function(s) {
    s.script.apply(object);
  })
};

ENGINE.GameObject.prototype.addScript = function(script, priority) {
  this.scripts.push({script: script, priority: priority || 0});
  this.scripts.sort(function(a, b) {
    return a.priority < b.priority;
  })
};

Object.defineProperty(ENGINE.GameObject.prototype, 'engineType', {
  get: function() {
    return this.body.userData.type;
  },
  set: function(v) {
    this.body.userData.type = v;
  }
});

// todo move these to a EngineGameObjectAdapter?

Object.defineProperty(ENGINE.GameObject.prototype, 'color', {
  get: function() {
    return '#' + this.material.color.getHexString();
  },
  set: function(v) {
    if (v.length !== 7) return;
    this.material.color.set(v);
  }
});

Object.defineProperty(ENGINE.GameObject.prototype, 'mass', {
  get: function() {
    return (this.body.type === p2.Body.DYNAMIC ? this.body.mass : 0);
  },
  set: function(v) {
    this.body.mass = v;
    this.body.type = v ? p2.Body.DYNAMIC : p2.Body.STATIC;
    this.body.updateMassProperties();
  }
});

Object.defineProperty(ENGINE.GameObject.prototype, 'x', {
  get: function() {
    return this.body.position[0];
  },
  set: function(v) {
    this.body.position[0] = v;
    this.position.x = v;
  }
});

Object.defineProperty(ENGINE.GameObject.prototype, 'y', {
  get: function() {
    return this.body.position[1];
  },
  set: function(v) {
    this.body.position[1] = v;
    this.position.y = v;
  }
});

Object.defineProperty(ENGINE.GameObject.prototype, 'angle', {
  get: function() {
    return this.body.angle;
  },
  set: function(v) {
    this.body.angle = v;
    this.rotation.z = v;
  }
});
