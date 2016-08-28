EDITOR.Cursor = function(size, color) {
  var geometry = new THREE.CircleGeometry(1.0, 4);
  var material = new THREE.MeshBasicMaterial({color: 0xff0000});
  
  THREE.Mesh.call(this, geometry, material);
  
  color && this.setColor(color);
  size && this.setSize(size);
};
ENGINE.utils.extend(EDITOR.Cursor, THREE.Mesh);

EDITOR.Cursor.prototype.setColor = function(color) {
  this.material.color.set(color);
};

EDITOR.Cursor.prototype.setSize = function(scale) {
  this.scale.setScalar(scale);
};

EDITOR.Cursor.prototype.setPosition = function(p) {
  
};
