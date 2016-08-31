EDITOR.EditTool = Vue.extend({
  template: `
    <div>
      <div v-if="selectedObject">
        <div><span>x</span><input type="number" v-model="selectedObject.x"></div>
        <div><span>y</span><input type="number" v-model="selectedObject.y"></div>
        <div><span>angle</span><input type="number" v-model="selectedObject.angle"></div>
        <div><span>color</span><input type="text" v-model="selectedObject.color"></div>
        <div><span>roughness</span><input type="number" v-model="selectedObject.material.roughness"></div>
        <div><span>metalness</span><input type="number" v-model="selectedObject.material.metalness"></div>
        <div><span>mass</span><input type="number" v-model="selectedObject.mass"></div>
        <div><button v-on:click="update">update</button><button v-on:click="reset">reset</button></div>
      </div>
    </div>
  `,
  props: [
  ],
  methods: {
    update: function() {
      this.$root.updateAsteroid(this.selectedObject);
    },
    reset: function() {

    }
  },
  data: function() {
    return {
      selectedObject: null
    };
  },

  ready: function() {
    this.selector = new THREE.BoxHelper(new THREE.Box3(), 0xff0000);

    this.mouseClickHandler = function(e) {
      if (e.which !== 1) return;

      var intersects = this.$root.intersectGameObjects();

      if (intersects && intersects.length) {
        this.$data.selectedObject = intersects[0].object;

        this.selector.update(this.$data.selectedObject);
        this.selector.geometry.center();
        this.$data.selectedObject.add(this.selector);
      }
    }.bind(this);

    //this.keyHandler = function(e) {
    //
    //};

    this.$root.engine.container.addEventListener('click', this.mouseClickHandler);
  },

  beforeDestroy: function() {
    if (this.$data.selectedObject) {
      this.$data.selectedObject.remove(this.selector);
      this.$data.selectedObject = null;
    }
    this.selector = null;

    this.$root.engine.container.removeEventListener('click', this.mouseClickHandler);
  }
});
