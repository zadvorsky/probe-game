EDITOR.AsteroidTool = Vue.extend({
  template: '<button v-on:click="generate">generate</button>',

  methods: {
    generate: function() {
      // this.$root.engine.remove(this.drawingLine);
      // this.$root.engine.remove(this.cursor);
      
      for (var i = 0; i < this.drawingLine.points.length; i++) {
        this.drawingLine.points[i].sub(this.asteroid.position);
      }
      
      this.drawingLine.computeBoundingBox();
      
      this.$root.storeAsteroid({
        points: this.drawingLine.points,
        position: this.asteroid.position,
        subdivisions: this.subdivisions,
        extrudeDepth: this.extrudeDepth,
        material: this.asteroidMaterial
      });
    }
  },
  data: function() {
    return {
      asteroidMaterial: {
        color: 0x222222,
        roughness: 1.0,
        metalness: 0.0
      },
      extrudeDepth: 1,
      subdivisions: 1
    };
  },

  ready: function() {
    var engine = this.$root.engine;
    var plane = this.$root.zPlane;
    var gridStep = this.$root.zPlane.stepSize;
    
    this.cursor = new EDITOR.Cursor(0.2);
    engine.add(this.cursor);
    
    this.drawingLine = new EDITOR.DrawingLine();
    engine.add(this.drawingLine);

    engine.container.style.cursor = 'crosshair';
    
    this.asteroid = new THREE.Mesh(
      new THREE.CircleGeometry(0.25, 4),
      new THREE.MeshBasicMaterial({
        color: 0xffffff
      })
    );

    var states = {
      place: 0,
      draw: 1,
      complete: 2
    };
    var state = states.place;
    
    this.mouseMoveHandler = function(e) {
      switch (state) {
        case states.place:
          break;
        case states.draw:
          this.drawingLine.updateLastPoint(this.cursor.position);
          break;
        case states.complete:
          break;
      }
    }.bind(this);
    
    this.mouseClickHandler = function(e) {
      switch (state) {
        case states.place:
          this.asteroid.position.copy(this.cursor.position);
          engine.add(this.asteroid);
          state = states.draw;
          break;
        case states.draw:
          this.drawingLine.appendPoint(this.cursor.position);
          this.drawingLine.isClosed() && (state = states.complete);
          break;
        case states.complete:
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
    this.$root.engine.container.style.cursor = '';
    
    this.$root.engine.remove(this.drawingLine);
    this.$root.engine.remove(this.cursor);
    
    cancelAnimationFrame(this.rafid);
  }
});
