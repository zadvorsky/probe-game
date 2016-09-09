EDITOR.EditTool = Vue.extend({
  template: `
    <div>
      <div v-if="selectedObject">
        
        <template v-if="selectedObject.gType == 'asteroid'">
          <div><span class="label">x</span><input type="number" number v-model="selectedObject.x"></div>
          <div><span class="label">y</span><input type="number" number v-model="selectedObject.y"></div>
          <div><span class="label">angle</span><input type="number" number v-model="selectedObject.angle"></div>
          <div><span class="label">color</span><input type="text" number v-model="selectedObject.color"></div>
          <div><span class="label">roughness</span><input type="number" number v-model="selectedObject.material.roughness"></div>
          <div><span class="label">metalness</span><input type="number" number v-model="selectedObject.material.metalness"></div>
          <div><span class="label">mass</span><input type="number" number v-model="selectedObject.mass"></div>
        </template>
        
        <template v-if="selectedObject.gType == 'beacon'">
          <div><span class="label">x</span><input type="number" v-model="selectedObject.x"></div>
          <div><span class="label">y</span><input type="number" v-model="selectedObject.y"></div>
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
