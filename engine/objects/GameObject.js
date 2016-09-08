ENGINE.GameObject = function(geometry, material, body, type) {
  THREE.Mesh.call(this, geometry, material);

  this.body = body;
  this.body.gameObject = this;
  this.scripts = [];
  this.gType = type;

  this.addScript(function() {
    this._x = this.position.x = this.body.position[0];
    this._y = this.position.y = this.body.position[1];
    this.rotation.z = this.body.angle;
  });

  this.update();
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
    return this._x;
  },
  set: function(v) {
    this._x = this.position.x = this.body.position[0] = v;
  }
});

Object.defineProperty(ENGINE.GameObject.prototype, 'y', {
  get: function() {
    return this._y;
  },
  set: function(v) {
    this._y = this.position.y = this.body.position[1] = v;
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
