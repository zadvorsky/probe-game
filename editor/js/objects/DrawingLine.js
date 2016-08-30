EDITOR.DrawingLine = function(points) {
  var material = new THREE.LineBasicMaterial({color: 0xff0000});
  var geometry = new THREE.BufferGeometry();
  var MAX_POINTS = 500;
  var positions = new Float32Array(MAX_POINTS * 3);
  
  geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setDrawRange(0, 0);
  
  THREE.Line.call(this, geometry, material);
  
  this.points = points;
  this.drawCount = 0;
  this.visible = false;
};
ENGINE.utils.extend(EDITOR.DrawingLine, THREE.Line);

EDITOR.DrawingLine.prototype.appendPoint = function(p) {
  this.points.push(p.clone());
  
  this.geometry.attributes.position.array[this.drawCount * 3]     = p.x;
  this.geometry.attributes.position.array[this.drawCount * 3 + 1] = p.y;
  this.geometry.attributes.position.array[this.drawCount * 3 + 2] = p.z;
  this.geometry.attributes.position.needsUpdate = true;
  this.geometry.setDrawRange(0, ++this.drawCount);
  
  if (this.drawCount === 1) {
    this.visible = true;
    this.appendPoint(p);
  }
};

EDITOR.DrawingLine.prototype.updateLastPoint = function(p) {
  this.points.length > 0 && this.points[this.points.length - 1].copy(p);
  
  var head = (this.drawCount - 1) * 3;
  
  this.geometry.attributes.position.array[head]     = p.x;
  this.geometry.attributes.position.array[head + 1] = p.y;
  this.geometry.attributes.position.array[head + 2] = p.z;
  this.geometry.attributes.position.needsUpdate = true;
};

EDITOR.DrawingLine.prototype.isClosed = function() {
  var isClosed = false;
  
  if (this.points.length > 2) {
    var first = this.points[0];
    var last = this.points[this.points.length - 1];
    
    isClosed = first.distanceTo(last) < 0.01;
  }
  
  return isClosed;
};

EDITOR.DrawingLine.prototype.reset = function() {
  this.drawCount = 0;
  this.points.length = 0;

  var a = this.geometry.attributes.position.array;

  for (var i = 0; i < a.length; i++) {
    a[i] = 0;
  }
};
