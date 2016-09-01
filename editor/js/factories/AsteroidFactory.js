EDITOR.AsteroidFactory = {
  create: function(data) {
    var shape = new THREE.Shape();
    shape.moveTo(data.points[0].x, data.points[0].y);
  
    for (var i = 1; i < data.points.length; i++) {
      shape.lineTo(data.points[i].x, data.points[i].y);
    }
  
    // 2. extrude shape
    var geometry = shape.extrude({
      amount: 0,
      bevelEnabled: true,
      bevelSegments: 1,
      steps: 1,
      bevelSize: 0,
      bevelThickness: data.extrudeDepth
    });
  
    // 3. subdivide shape
    new THREE.SubdivisionModifier(data.subdivisions).modify(geometry);
  
    // 4. calculate center
  
    var geometryCenter = new THREE.Vector3();
    geometry.computeBoundingBox();
    geometry.boundingBox.center(geometryCenter);
    geometry.center();
  
    // MATERIAL
  
    var material = new THREE.MeshStandardMaterial(Object.assign({
      shading: THREE.FlatShading
    }, data.material));
  
    // BODY
  
    var contour = [];
  
    geometry.vertices.forEach(function(v) {
      if (v.z === 0) contour.push([v.x, v.y]);
    });
  
    // swap first and second point because default order is wrong
    var temp = contour[0];
    contour[0] = contour[1];
    contour[1] = temp;
  
    var body = new p2.Body({
      mass: data.mass || 0,
      position: [geometryCenter.x, geometryCenter.y]
    });
  
    if (!body.fromPolygon(contour)) {
      console.log('error generating p2.shapes');
    }
  
    // ASTEROID
  
    var asteroid = new ENGINE.GameObject(geometry, material, body);
    asteroid.position.copy(geometryCenter);
    asteroid.castShadow = true;
    asteroid.receiveShadow = true;
  
    // adjust asteroid geometry to match with the p2 body
    // TODO figure out why geometry and body do not match
    // TODO simplify calculation
    var aabb = body.getAABB();
    var bodyBox = new THREE.Box3(
      new THREE.Vector3(aabb.lowerBound[0] - body.position[0], aabb.lowerBound[1] - body.position[1]),
      new THREE.Vector3(aabb.upperBound[0] - body.position[0], aabb.upperBound[1] - body.position[1])
    );
    var offset = new THREE.Vector3().subVectors(bodyBox.min, geometry.boundingBox.min);
  
    geometry.translate(offset.x, offset.y, 0);
    
    // update to sync body & mesh
    asteroid.update();
    
    return asteroid;
  }
};
