//=require ../../engine/engine.js

//=require ../../bower_components/three.js/examples/js/controls/OrbitControls.js
//=require ../../bower_components/three.js/examples/js/geometries/ConvexGeometry.js
//=require ../../bower_components/three.js/examples/js/modifiers/TessellateModifier.js
//=require ../../bower_components/three.js/examples/js/modifiers/SubdivisionModifier.js
//=require ../../bower_components/vue/dist/vue.js
//=require ../../bower_components/vue-router/dist/vue-router.js
//=require ../../bower_components/vue-resource/dist/vue-resource.js

//=require init.js
//=require utils.js
//=require objects/*.js
//=require tools/*.js
//=require factories/*.js

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
  var controls = new THREE.OrbitControls(camera, engineContainer);
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
  // vue.js setup
  ////////////////////////////

  Vue.use(VueRouter);
  Vue.use(VueResource);

  var App = Vue.extend({
    methods: {
      intersect: intersect,

      intersectGameObjects: function() {
        return intersect(engine.asteroids);
      },

      storeAsteroid: function(data, asteroid) {
        console.log('store asteroid', data, asteroid);

        //console.log(JSON.stringify(asteroid.toJSON()));

        this.level.asteroids.push(data);
      },

      updateAsteroid: function(asteroid) {
        console.log('update', asteroid.userData.config)
      },
      resetAsteroid: function() {

      },




      createLevel: function(name) {
        this.clearLevel();

        this.level = {
          name: name,
          asteroids: []
        };

        this.saveLevel();
      },
      saveLevel: function() {
        this.$http.post('/save', this.level).then(function(resp) {
          console.log('saved level ' + this.level.name);
          
          // maybe? or return the list of file names in node
          this.loadLevels();
        });
      },
      clearLevel: function() {
        engine.clear();
        this.level.asteroids && (this.level.asteroids.length = 0);
      },
      loadLevels: function() {
        return this.$http.post('/levels').then(function(resp) {
          console.log('loaded levels', resp.data);
          this.levels = resp.data;
        });
      },
      loadLevel: function(name) {
        this.clearLevel();
  
        // note to self: name is INC extension here, without extension is create and save
        this.$http.post('/load', {name:name}).then(function(resp) {
          console.log('loaded level ' + name, resp.data);
          this.level = resp.data;

          engine.parseLevelJSON(this.level);
        });
      }
    },
    
    data: function() {
      return {
        engine: engine,
        camera: camera,
        controls: controls,
        zPlane: editorZPlane,
  
        levels: [],
        level: {}
      }
    }
  });

  var router = new VueRouter();

  router.map({
    '/level': {
      component: EDITOR.LevelsTool
    },
    '/camera': {
      component: EDITOR.CameraTool
    },
    '/asteroid': {
      component: EDITOR.AsteroidTool
    },
    '/edit': {
      component: EDITOR.EditTool
    }
  });

  router.start(App, '#app');
  router.app.loadLevels().then(function() {
    this.loadLevel(this.levels[0]);
  });
  
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
     engine.update(true);
   }
  });
})();
