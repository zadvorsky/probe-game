GAME.Probe = function() {
  var geometry = new THREE.SphereGeometry(1.0, 16, 16);
  var material = new THREE.MeshBasicMaterial({color: 0xffffff});

  var shape = new p2.Circle({
    radius: 1.0
  });
  var body = new p2.Body({
    mass: 1.0
  });
  body.addShape(shape);

  GAME.GameObject.call(this, geometry, material, body);
};
GAME.utils.extend(GAME.Probe, GAME.GameObject);
