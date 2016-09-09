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
    this.cursor = new EDITOR.Cursor(0.2);
    this.$root.zPlane.setCursor(this.cursor);
    
    this.drawingLine = new EDITOR.DrawingLine(this.points);
    this.$root.engine.add(this.drawingLine, false);

    this.$root.engine.container.style.cursor = 'crosshair';

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

    this.$root.engine.container.addEventListener('mousemove', this.mouseMoveHandler);
    this.$root.engine.container.addEventListener('click', this.mouseClickHandler);
  },

  beforeDestroy: function() {
    this.$root.zPlane.setCursor(null);
    this.$root.engine.container.style.cursor = '';
    this.$root.engine.container.removeEventListener('mousemove', this.mouseMoveHandler);
    this.$root.engine.container.removeEventListener('click', this.mouseClickHandler);

    this.destroyAsteroid();
    this.$root.engine.remove(this.drawingLine);
  }
});
