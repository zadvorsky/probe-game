EDITOR.EditTool = Vue.extend({
  template: `
    <div>
      <div v-if="selectedObject">
        
        <template v-if="selectedObject.gType == 'asteroid'">
          <number-input :value.sync="selectedObject.x" label="x"></number-input>
          <number-input :value.sync="selectedObject.y" label="y"></number-input>
          <number-input :value.sync="selectedObject.angle" label="angle"></number-input>
          <text-input :value.sync="selectedObject.color" label="color"></text-input>
          <number-input :value.sync="selectedObject.material.roughness" label="roughness"></number-input>
          <number-input :value.sync="selectedObject.material.metalness" label="metalness"></number-input>
          <number-input :value.sync="selectedObject.mass" label="mass"></number-input>
        </template>
        
        <template v-if="selectedObject.gType == 'beacon'">
          <number-input :value.sync="selectedObject.x" label="x"></number-input>
          <number-input :value.sync="selectedObject.y" label="y"></number-input>
        </template>
        
        <template v-if="selectedObject.gType == 'target'">
          <number-input :value.sync="selectedObject.x" label="x"></number-input>
          <number-input :value.sync="selectedObject.y" label="y"></number-input>
        </template>
        
        <div><button v-on:click="update">update</button><button v-on:click="delete">delete</button></div>
      </div>
    </div>
  `,
  methods: {
    update: function() {
      this.$root.updateGameObject(this.selectedObject);
    },
    delete: function() {
      this.$root.deleteGameObject(this.selectedObject);
      this.selectedObject = null;
    },

    autoUpdate: function(newVal, oldVal) {
      if (oldVal !== null && newVal !== oldVal) {
        this.update();
      }
    }
  },
  data: function() {
    return {
      selectedObject: null
    };
  },
  watch: {
    'selectedObject && selectedObject.x': function(newVal, oldVal) {this.autoUpdate(newVal, oldVal)},
    'selectedObject && selectedObject.y': function(newVal, oldVal) {this.autoUpdate(newVal, oldVal)},
    'selectedObject && selectedObject.angle': function(newVal, oldVal) {this.autoUpdate(newVal, oldVal)},
    'selectedObject && selectedObject.color': function(newVal, oldVal) {this.autoUpdate(newVal, oldVal)},
    'selectedObject && selectedObject.material.roughness': function(newVal, oldVal) {this.autoUpdate(newVal, oldVal)},
    'selectedObject && selectedObject.material.metalness': function(newVal, oldVal) {this.autoUpdate(newVal, oldVal)},
    'selectedObject && selectedObject.mass': function(newVal, oldVal) {this.autoUpdate(newVal, oldVal)}
  },

  ready: function() {
    this.selector = new THREE.BoxHelper(new THREE.Box3(), 0xff0000);

    this.mouseClickHandler = function(e) {
      if (e.which !== 1) return;

      var intersects = this.$root.intersectGameObjects();

      if (intersects && intersects.length) {
        if (this.$data.selectedObject === intersects[0].object) return;

        this.$data.selectedObject = intersects[0].object;
        this.selector.update(this.$data.selectedObject);
        this.selector.geometry.center();
        this.$data.selectedObject.add(this.selector);
      }
    }.bind(this);

    this.$root.engine.container.addEventListener('click', this.mouseClickHandler);

    // up = 38
    // right = 39
    // down = 40
    // left = 37
    this.keyHandler = function(e) {
      var handled = true;
      var step = e.shiftKey ? 1.0 : 0.1;

      if (!this.selectedObject) return;

      switch (e.keyCode) {
        case 38:
          this.selectedObject.y += step;
          break;
        case 40:
          this.selectedObject.y -= step;
          break;
        case 39:
          this.selectedObject.x += step;
          break;
        case 37:
          this.selectedObject.x -= step;
          break;
        default:
          handled = false;
      }

      handled && e.preventDefault();
    }.bind(this);

    window.addEventListener('keydown', this.keyHandler);
  },

  beforeDestroy: function() {
    if (this.$data.selectedObject) {
      this.$data.selectedObject.remove(this.selector);
      this.$data.selectedObject = null;
    }
    this.selector = null;

    this.$root.engine.container.removeEventListener('click', this.mouseClickHandler);
    window.removeEventListener('keyup', this.keyHandler);
  }
});
