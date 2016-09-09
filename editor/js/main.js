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
  Vue.use(VueRouter);
  Vue.use(VueResource);

  var App = Vue.extend({
    created: function() {
      // containers
      var engineContainer = document.querySelector('#three-container');
      var uiContainer = document.querySelector('#ui-container');

      // engine
      this.engine = new ENGINE.Engine(engineContainer);
      this.engine.paused = true;

      // camera & camera controls
      this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100000);
      this.camera.position.z = 20;
      this.controls = new THREE.OrbitControls(this.camera, engineContainer);
      this.controls.keys = false;
      this.controls.enableRotate = false;
      this.engine.registerCamera('editor', this.camera);
      this.engine.activateCamera('editor');

      // grid / editing pane
      this.zPlane = new EDITOR.ZPlane(100, 0.25);
      this.engine.add(this.zPlane, false);

      // mouse handling
      this.mouseNDC = new THREE.Vector2();
      this.raycaster = new THREE.Raycaster();

      engineContainer.addEventListener('mousemove', function(e) {
        this.mouseNDC.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
      }.bind(this));

      // key handling

      var routeBeforePlay = '';

      window.addEventListener('keyup', function(e) {
        // p
        if (e.keyCode === 80) {
          this.engine.paused = !this.engine.paused;

          if (this.engine.paused) {
            uiContainer.style.display = 'block';
            this.zPlane.visible = true;
            this.engine.activateCamera('editor');

            this.$router.go(routeBeforePlay);
          }
          else {
            uiContainer.style.display = 'none';
            this.zPlane.visible = false;
            this.engine.activateCamera('game');

            routeBeforePlay = this.$router._currentRoute.path;
            this.$router.go('/');
          }
        }
        // r
        if (e.keyCode === 82) {
          this.engine.reset();
          this.engine.parseLevelJSON(this.level);
          this.engine.update(true);
        }
      }.bind(this));
    },

    methods: {
      intersect: function(objects) {
        this.raycaster.setFromCamera(this.mouseNDC, this.camera);

        if (Array.isArray(objects)) {
          return this.raycaster.intersectObjects(objects);
        }
        else {
          return this.raycaster.intersectObject(objects);
        }
      },
      intersectGameObjects: function() {
        return this.intersect(this.engine.gameObjects);
      },

      storeGameObject: function(object) {
        this.level.objects.push(object.toJSON());
      },
      updateGameObject: function(object) {
        var index = this.engine.gameObjects.indexOf(object);
        this.level.objects[index] = object.toJSON();
      },
      deleteGameObject: function(object) {
        var index = this.engine.gameObjects.indexOf(object);
        this.level.objects.splice(index, 1);
        this.engine.remove(object);
      },

      createLevel: function(name) {
        this.clearLevel();

        this.level = {
          name: name,
          objects: []
        };

        this.saveLevel();
      },
      saveLevel: function() {
        return this.$http.post('/save', this.level).then(function(resp) {
          console.log('saved level ' + this.level.name);
          // maybe? or return the list of file names in node
          this.loadLevels();
        });
      },
      clearLevel: function() {
        this.engine.clear();
        this.level.objects && (this.level.objects.length = 0);
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
        return this.$http.post('/load', {name:name}).then(function(resp) {
          console.log('loaded level ' + name);
          this.level = resp.data;
          this.engine.parseLevelJSON(this.level);
        });
      },

      saveConfig: function() {
        return this.$http.post('/saveConfig', ENGINE.config).then(function(resp) {
          console.log('saved config');
        });
      }
    },
    
    data: function() {
      return {
        engine: null,
        camera: null,
        controls: null,
        zPlane: null,
  
        levels: [],
        level: {}
      }
    }
  });

  var router = new VueRouter();

  router.map({
    '/level': {component: EDITOR.LevelsTool},
    '/camera': {component: EDITOR.CameraTool},
    '/probe': {component: EDITOR.ProbeTool},
    '/asteroid': {component: EDITOR.AsteroidTool},
    '/beacon': {component: EDITOR.BeaconTool},
    '/edit': {component: EDITOR.EditTool}
  });

  var request = new XMLHttpRequest();
  request.open('POST', 'http://localhost:3000/loadConfig', true);
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.onload = function(e) {
    //Object.assign(ENGINE.config, JSON.parse(e.target.response));
    ENGINE.config = JSON.parse(e.target.response);

    console.log('CONFIG', ENGINE.config);

    router.start(App, '#app');
    router.app.loadLevels().then(function() {
      this.loadLevel(this.levels[0]);
    });
  };
  request.send();
})();
