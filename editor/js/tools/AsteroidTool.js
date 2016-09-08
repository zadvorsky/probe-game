EDITOR.AsteroidTool = Vue.extend({
  template: `
    <div>
      <div><span class="label">extrude</span><input type="number" v-model="extrudeDepth"></div>
      <div><span class="label">color</span><input type="text" v-model="material.color"></div>
      <div><span class="label">roughness</span><input type="number" v-model="material.roughness"></div>
      <div><span class="label">metalness</span><input type="number" v-model="material.metalness"></div>
      <div><span class="label">mass</span><input type="number" v-model="mass"></div>
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

      this.asteroid = EDITOR.AsteroidFactory.create(this.$data);
      this.$root.engine.add(this.asteroid);
    },
    store: function() {
      this.$root.storeGameObject(this.asteroid);
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
        roughness: 1.0,
        metalness: 0.0
      },
      extrudeDepth: 0.25,
      subdivisions: 1,
      mass: 10,
      angle: 0
    };
  },

  ready: function() {
    var engine = this.$root.engine;
    var plane = this.$root.zPlane;

    this.cursor = new EDITOR.Cursor(0.2);
    engine.add(this.cursor, false);
    
    this.drawingLine = new EDITOR.DrawingLine(this.points);
    engine.add(this.drawingLine, false);

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

        // if snapping
        plane.snapPoint(p);

        this.cursor.position.copy(p);
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
