EDITOR.AsteroidTool = Vue.extend({
  template: `
    <div>
      <div><span>extrude</span><input type="number" v-model="extrudeDepth"></div>
      <div><span>color</span><input type="text" v-model="material.color"></div>
      <div><span>roughness</span><input type="number" v-model="material.roughness"></div>
      <div><span>metalness</span><input type="number" v-model="material.metalness"></div>
      <div><span>mass</span><input type="number" v-model="mass"></div>
      <div><button v-on:click="generate">generate</button></div>
      <div><button v-on:click="reset">reset</button></div>
      <div><button v-on:click="store">store</button></div>
    </div>
  `,

  methods: {
    destroyAsteroid: function() {
      if (this.asteroid) {
        this.$root.engine.remove(this.asteroid);
        this.asteroid = null;
      }
    },

    generate: function() {
      this.destroyAsteroid();

      var shape = new THREE.Shape();
      shape.moveTo(this.points[0].x, this.points[0].y);

      for (var i = 1; i < this.points.length; i++) {
        shape.lineTo(this.points[i].x, this.points[i].y);
      }

      // 2. extrude shape
      var geometry = shape.extrude({
        amount: 0,
        bevelEnabled: true,
        bevelSegments: 1,
        steps: 1,
        bevelSize: 0,
        bevelThickness: this.extrudeDepth
      });

      // 3. subdivide shape
      new THREE.SubdivisionModifier(this.subdivisions).modify(geometry);

      // 4. calculate center

      var geometryCenter = new THREE.Vector3();
      geometry.computeBoundingBox();
      geometry.boundingBox.center(geometryCenter);
      geometry.center();

      // MATERIAL

      var material = new THREE.MeshStandardMaterial(Object.assign({
        shading: THREE.FlatShading
      }, this.material));

      // test material
      //var material = new THREE.MeshBasicMaterial({
      //  wireframe: true,
      //  color: 0x00ffff,
      //  transparent: true,
      //  opacity: 0.1
      //});

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
        mass: this.mass || 0,
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

      // body shapes debug geometry
      for (i = 0; i < body.shapes.length; i++) {
        var g = new THREE.Geometry();
        var s = body.shapes[i];

        g.vertices = s.vertices.map(function(v) {
          return new THREE.Vector3(v[0], v[1], 0);
        });

        var hullLine = new THREE.Line(g, new THREE.LineBasicMaterial({color:0xff00ff}));
        hullLine.position.x = s.position[0];
        hullLine.position.y = s.position[1];
        asteroid.add(hullLine);

        hullLine.add(new THREE.Mesh(
          new THREE.CircleGeometry(0.1, 4),
          new THREE.MeshBasicMaterial({
            color: 0xff00ff
          })
        ));
      }

      asteroid.update();

      asteroid.userData.defaultPosition = geometryCenter;

      this.asteroid = asteroid;

      this.$root.engine.add(this.asteroid);

      console.log('--created--');

      console.log(asteroid.body.shapes);

      //this.asteroid = this.$root.engine.createAsteroid(this.$data);
    },

    store: function() {
      //var clonedData = JSON.parse(JSON.stringify(this.$data));

      var body = this.asteroid.body;

      // position? rotation?
      var bodyJSON = {
        mass: body.mass,
        position: toPlainArray(body.position),
        angle: body.angle,
        shapes: []
      };

      function toPlainArray(ta) {
        return Array.prototype.slice.call(ta);
      }

      for (var i = 0; i < body.shapes.length; i++) {
        var shape = body.shapes[i];
        var shapeJSON = {
          pos: toPlainArray(shape.position),
          vertices: []
        };

        for (var j = 0; j < shape.vertices.length; j++) {
          shapeJSON.vertices.push(toPlainArray(shape.vertices[j]));
        }

        bodyJSON.shapes.push(shapeJSON);
      }

      var data = {
        geometry: this.asteroid.geometry.toJSON(),
        material: this.asteroid.material.toJSON(),
        body: bodyJSON
      };

      this.$root.storeAsteroid(data, this.asteroid);
      this.asteroid = null;
      this.reset();
    },

    reset: function() {
      if (this.asteroid) {
        this.$root.engine.remove(this.asteroid);
      }
      this.asteroid = null;

      this.drawingLine.reset();
      this.state = this.states.draw;
    }
  },
  data: function() {
    return {
      points: [],

      material: {
        color: '#666666',
        roughness: 0.5,
        metalness: 0.5
      },
      extrudeDepth: 0.25,
      subdivisions: 1,
      mass: 0,
      angle: 0
    };
  },

  ready: function() {
    var engine = this.$root.engine;
    var plane = this.$root.zPlane;
    var gridStep = this.$root.zPlane.stepSize;
    
    this.cursor = new EDITOR.Cursor(0.2);
    engine.add(this.cursor);
    
    this.drawingLine = new EDITOR.DrawingLine(this.points);
    engine.add(this.drawingLine);

    engine.container.style.cursor = 'crosshair';
    
    this.states = {
      draw: 1,
      complete: 2
    };
    this.state = this.states.draw;
    
    this.mouseMoveHandler = function(e) {
      switch (this.state) {
        case this.states.draw:
          this.drawingLine.updateLastPoint(this.cursor.position);
          break;
        case this.states.complete:
          break;
      }
    }.bind(this);
    
    this.mouseClickHandler = function(e) {
      if (e.which !== 1) return;

      switch (this.state) {
        case this.states.draw:
          this.drawingLine.appendPoint(this.cursor.position);
          this.drawingLine.isClosed() && (this.state = this.states.complete);
          break;
        case this.states.complete:
          break;
      }
    }.bind(this);
    
    engine.container.addEventListener('mousemove', this.mouseMoveHandler);
    engine.container.addEventListener('click', this.mouseClickHandler);

    var update = function() {
      var intersects = this.$root.intersect(plane);

      if (intersects && intersects.length) {
        var p = intersects[0].point;
        var x = Math.round(p.x / gridStep) * gridStep;
        var y = Math.round(p.y / gridStep) * gridStep;
        this.cursor.position.set(x, y, p.z);
      }

      this.rafid = requestAnimationFrame(update);
    }.bind(this);

    update();
  },

  beforeDestroy: function() {
    this.destroyAsteroid();

    this.$root.engine.container.style.cursor = '';
    
    this.$root.engine.remove(this.drawingLine);
    this.$root.engine.remove(this.cursor);

    this.$root.engine.container.removeEventListener('mousemove', this.mouseMoveHandler);
    this.$root.engine.container.removeEventListener('click', this.mouseClickHandler);

    cancelAnimationFrame(this.rafid);
  }
});
