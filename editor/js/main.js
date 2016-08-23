//=require ../../engine/engine.js

//=require ../../bower_components/three.js/examples/js/controls/OrbitControls.js
//=require ../../bower_components/vue/dist/vue.js

//=require init.js
//=require tools/*.js

(function() {
  //var vue = new Vue({
  //  el: '#app',
  //  data: {
  //    message: 'Hello Vue.js!'
  //  }
  //});

  var engineContainer = document.querySelector('#three-container');
  var uiContainer = document.querySelector('#ui-container');

  var engine = new GAME.Engine(engineContainer);
  engine.paused = true;

  var gridSize = 100;
  var gridSegments = 400;
  var gridStep = gridSize * 2 / gridSegments;

  var editorZPlane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(gridSize * 2, gridSize * 2),
    new THREE.MeshBasicMaterial({
      visible: false
    })
  );
  editorZPlane.rotation.x = Math.PI * -0.5;
  engine.add(editorZPlane);

  var grid = new THREE.GridHelper(gridSize, gridSegments, 0x444444, 0x444444);
  editorZPlane.add(grid);



  var camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100000);
  camera.position.z = 20;
  var controls = new THREE.OrbitControls(camera);
  controls.keys = false;
  engine.registerCamera('editor', camera);
  engine.activateCamera('editor');



  // todo key to command map
  window.addEventListener('keyup', function(e) {
    // p
    if (e.keyCode === 80) {
      engine.paused = !engine.paused;

      if (engine.paused) {
        uiContainer.style.display = 'block';
        editorZPlane.visible = true;
        engine.activateCamera('editor');
      }
      else {
        uiContainer.style.display = 'none';
        editorZPlane.visible = false;
        engine.activateCamera('game');
      }
    }
    // r
    if (e.keyCode === 82) {
      engine.reset();
    }
  });



  //var mouseNDC = new THREE.Vector2();
  //var rc = new THREE.Raycaster();
  //
  //var material = new THREE.LineBasicMaterial({color: 0xff0000});
  //var geometry = new THREE.BufferGeometry();
  //var MAX_POINTS = 500;
  //var drawCount = 0;
  //
  //var positions = new Float32Array(MAX_POINTS * 3); // 3 vertices per point
  //geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
  //geometry.setDrawRange(0, drawCount);
  //
  //var line = new THREE.Line(geometry, material);
  //
  //function appendPoint(p) {
  //  geometry.attributes.position.array[drawCount * 3]     = p.x;
  //  geometry.attributes.position.array[drawCount * 3 + 1] = p.y;
  //  geometry.attributes.position.array[drawCount * 3 + 2] = p.z;
  //  geometry.attributes.position.needsUpdate = true;
  //
  //  drawCount++;
  //  geometry.setDrawRange(0, drawCount);
  //}
  //
  //function updateLastPoint(p) {
  //  var head = (drawCount - 1) * 3;
  //
  //  geometry.attributes.position.array[head]     = p.x;
  //  geometry.attributes.position.array[head + 1] = p.y;
  //  geometry.attributes.position.array[head + 2] = p.z;
  //  geometry.attributes.position.needsUpdate = true;
  //}
  //
  //var tracker = new THREE.Mesh(
  //  new THREE.CircleGeometry(0.2, 16),
  //  new THREE.MeshBasicMaterial({
  //    color: 0xff0000,
  //    transparent: true,
  //    opacity: 0.5
  //  })
  //);
  //engine.add(tracker);
  //
  //var firstPoint;
  //
  ////document.body.style.cursor = 'crosshair';
  //
  //engine.container.addEventListener('mousemove', function(e) {
  //  mouseNDC.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
  //  updateLastPoint(tracker.position);
  //});
  //engine.container.addEventListener('click', function(e) {
  //  if (drawCount === 0) {
  //    engine.add(line);
  //    firstPoint = tracker.position.clone();
  //    appendPoint(tracker.position);
  //  }
  //
  //  appendPoint(tracker.position);
  //
  //  if (drawCount > 2 && firstPoint.distanceTo(tracker.position) < 0.1 ) {
  //    console.log('close the shape and generate stuff');
  //  }
  //});
  //
  //function update() {
  //  rc.setFromCamera(mouseNDC, camera);
  //  var intersects = rc.intersectObject(plane);
  //
  //  if (intersects) {
  //    var p = intersects[0].point;
  //    var x = Math.round(p.x / gridStep) * gridStep;
  //    var y = Math.round(p.y / gridStep) * gridStep;
  //
  //    tracker.position.set(x, y, p.z);
  //  }
  //
  //  requestAnimationFrame(update);
  //}
  //update();






})();







//var levels = [];
//
//function loadLevel(name) {
//  var request = new XMLHttpRequest();
//  request.open('POST', 'http://localhost:3000/load', true);
//  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
//  request.onload = function(e) {
//    console.log('level loaded', JSON.parse(e.target.response));
//  };
//  request.send(JSON.stringify({name: name}));
//}
//
//function loadLevels() {
//  var request = new XMLHttpRequest();
//  request.open('POST', 'http://localhost:3000/levels', true);
//  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
//  request.onload = function(e) {
//    levels = JSON.parse(e.target.response);
//
//    console.log('levels loaded', levels);
//
//    loadLevel(levels[0]);
//  };
//  request.send();
//}
//
//loadLevels();
//
//function save() {
//  var data = {
//    level_name: 'level_1',
//    level_data: {
//      obj_1: {
//        vertices: [
//          {x: 0, y: 0}
//        ]
//      }
//    }
//  };
//
//  var request = new XMLHttpRequest();
//  request.open('POST', 'http://localhost:3000/save', true);
//  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
//  request.onload = function(e) {
//    console.log('ONLOAD', e);
//  };
//  request.send(JSON.stringify(data));
//}
