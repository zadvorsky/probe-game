EDITOR.AsteroidTool = Vue.extend({
  template: '<button v-on:click="generate">generate</button>',

  methods: {
    generate: function() {
      // this.$root.engine.remove(this.drawingLine);
      // this.$root.engine.remove(this.cursor);
      
      var min = new THREE.Vector3(Infinity, Infinity, 0);
      var max = new THREE.Vector3(-Infinity, -Infinity, 0);
  
      for (var i = 0; i < this.drawingLine.points.length; i++) {
        var p = this.drawingLine.points[i];
  
        if (p.x < min.x) min.x = p.x;
        if (p.y < min.y) min.y = p.y;
        if (p.x > max.x) max.x = p.x;
        if (p.y > max.y) max.y = p.y;
      }
  
      var center = new THREE.Vector3().addVectors(min, max).multiplyScalar(0.5);
      
      for (i = 0; i < this.drawingLine.points.length; i++) {
        this.drawingLine.points[i].sub(center);
      }
      
      this.$root.storeAsteroid({
        points: this.drawingLine.points,
        position: center,
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
    
    var states = {
      draw: 1,
      complete: 2
    };
    var state = states.draw;
    
    this.mouseMoveHandler = function(e) {
      switch (state) {
        case states.draw:
          this.drawingLine.updateLastPoint(this.cursor.position);
          break;
        case states.complete:
          break;
      }
    }.bind(this);
    
    this.mouseClickHandler = function(e) {
      switch (state) {
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
