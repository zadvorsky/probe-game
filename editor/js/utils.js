EDITOR.utils = {
  drawBodyShapes: function(object) {
    var body = object.body;
    
    for (var i = 0; i < body.shapes.length; i++) {
      var g = new THREE.Geometry();
      var s = body.shapes[i];

      g.vertices = s.vertices.map(function(v) {
        return new THREE.Vector3(v[0], v[1], 0);
      });

      var hullLine = new THREE.Line(g, new THREE.LineBasicMaterial({color:0xff00ff}));
      hullLine.position.x = s.position[0];
      hullLine.position.y = s.position[1];

      object.add(hullLine);
      object.add(new THREE.Mesh(
        new THREE.CircleGeometry(0.1, 4),
        new THREE.MeshBasicMaterial({
          color: 0xff00ff
        })
      ));
    }
  }
};
