EDITOR.ZPlane = function(size, step) {
  var geometry = new THREE.PlaneBufferGeometry(size, size);
  var material = new THREE.MeshBasicMaterial({visible: false});

  THREE.Mesh.call(this, geometry, material);

  this.size = size;
  this.setStep(step);
};
ENGINE.utils.extend(EDITOR.ZPlane, THREE.Mesh);

EDITOR.ZPlane.prototype.setStep = function(step) {
  this.step = step;

  this.grid && this.remove(this.grid);

  this.grid = new THREE.GridHelper(this.size * 0.5, this.size / this.step * 0.5, 0x444444, 0x444444);
  this.grid.rotation.x = Math.PI * 0.5;
  this.add(this.grid);
};

EDITOR.ZPlane.prototype.snapPoint = function(point) {
  point.x = Math.round(point.x / this.step) * this.step;
  point.y = Math.round(point.y / this.step) * this.step;

  return point;
};

EDITOR.ZPlane.prototype.setCursor = function(cursor) {
  this.cursor && this.remove(this.cursor);
  this.cursor = cursor;
  this.cursor && this.add(cursor);
};

EDITOR.ZPlane.prototype.updateCursor = function(intersects) {
  if (this.cursor && intersects && intersects.length) {
    this.cursor.position.copy(this.snapPoint(intersects[0].point));
  }
};
