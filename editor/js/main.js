//=require ../../engine/engine.js

//=require ../../bower_components/three.js/examples/js/controls/OrbitControls.js
//=require ../../bower_components/three.js/examples/js/geometries/ConvexGeometry.js
//=require ../../bower_components/three.js/examples/js/modifiers/TessellateModifier.js
//=require ../../bower_components/three.js/examples/js/modifiers/SubdivisionModifier.js
//=require ../../bower_components/vue/dist/vue.js
//=require ../../bower_components/vue-router/dist/vue-router.js
//=require ../../bower_components/vue-resource/dist/vue-resource.js

//=require init.js
//=require objects/*.js
//=require tools/*.js

(function() {
  ////////////////////////////
  // global/engine objects
  ////////////////////////////

  // containers
  var engineContainer = document.querySelector('#three-container');
  var uiContainer = document.querySelector('#ui-container');

  // engine
  var engine = new ENGINE.Engine(engineContainer);
  engine.paused = true;

  // camera & camera controls
  var camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100000);
  camera.position.z = 20;
  var controls = new THREE.OrbitControls(camera);
  controls.keys = false;
  controls.enableRotate = false;
  engine.registerCamera('editor', camera);
  engine.activateCamera('editor');

  // lights?
  //var light = new THREE.DirectionalLight(0xffffff, 0.25);
  //light.position.set(0, 0, 1);
  //engine.add(light);

  // grid / editing pane
  var gridSize = 100;
  var gridSegments = 400;
  var gridStep = gridSize * 2 / gridSegments;

  var editorZPlane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(gridSize * 2, gridSize * 2),
    new THREE.MeshBasicMaterial({
      visible: false
    })
  );
  editorZPlane.stepSize = gridStep;

  var grid = new THREE.GridHelper(gridSize, gridSegments, 0x444444, 0x444444);
  grid.rotation.x = Math.PI * 0.5;
  editorZPlane.add(grid);

  engine.add(editorZPlane);
  
  ////////////////////////////
  // mouse handling
  ////////////////////////////
  
  var mouseNDC = new THREE.Vector2();
  var raycaster = new THREE.Raycaster();
  
  engineContainer.addEventListener('mousemove', function(e) {
    mouseNDC.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
  });
  
  function intersect(objects) {
    raycaster.setFromCamera(mouseNDC, camera);
    
    if (Array.isArray(objects)) {
      return raycaster.intersectObjects(objects);
    }
    else {
      return raycaster.intersectObject(objects);
    }
  }
  
  ////////////////////////////
  // asteroid handling
  ////////////////////////////
  
  function storeAsteroid(config) {
    var data = JSON.parse(JSON.stringify(config));

    var asteroid = engine.createAsteroid(data);

    currentLevel.asteroids.push(data);

    saveCurrentLevel();

    engine.add(asteroid);
    
    // this.$root.engine.add(data.asteroid);
  }
  
  ////////////////////////////
  // vue.js setup
  ////////////////////////////

  Vue.use(VueRouter);
  Vue.use(VueResource);

  var currentLevel = {
    asteroids: []
  };

  var App = Vue.extend({
    methods: {
      intersect: intersect,
      storeAsteroid: storeAsteroid
    },
    
    data: function() {
      return {
        engine: engine,
        camera: camera,
        controls: controls,
        zPlane: editorZPlane
      }
    }
  });
  var Global = Vue.extend({template: '<div>global</div>'});

  var router = new VueRouter();

  router.map({
    '/global': {
      component: Global
    },
    '/camera': {
      component: EDITOR.CameraTool
    },
    '/asteroid': {
      component: EDITOR.AsteroidTool
    }
  });

  //router.beforeEach(function(t) {});

  router.start(App, '#app');

  router.app.$http.post('/load', {name:'level_1.json'}).then(function(resp) {
    console.log('loaded levels', resp);
    currentLevel = resp.data;
    engine.parseLevelJSON(resp.data);
  });

  function saveCurrentLevel() {
    var data = {
      level_name: 'level_1',
      level_data: currentLevel
      //level_data: {asteroids: []}
    };

    console.log('saving..', currentLevel);

    router.app.$http.post('/save', data).then(function(resp) {
      console.log('level saved', resp);
    });
  }

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
