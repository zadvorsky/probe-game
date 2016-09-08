EDITOR.EditTool = Vue.extend({
  template: `
    <div>
      <div v-if="selectedObject">
        
        <template v-if="selectedObject.gameObjectType == 'asteroid'">
          <div><span class="label">x</span><input type="number" v-model="selectedObject.x"></div>
          <div><span class="label">y</span><input type="number" v-model="selectedObject.y"></div>
          <div><span class="label">angle</span><input type="number" v-model="selectedObject.angle"></div>
          <div><span class="label">color</span><input type="text" v-model="selectedObject.color"></div>
          <div><span class="label">roughness</span><input type="number" v-model="selectedObject.material.roughness"></div>
          <div><span class="label">metalness</span><input type="number" v-model="selectedObject.material.metalness"></div>
          <div><span class="label">mass</span><input type="number" v-model="selectedObject.mass"></div>
        </template>
        
        <template v-if="selectedObject.gameObjectType == 'beacon'">
          <div><span class="label">x</span><input type="number" v-model="selectedObject.x"></div>
          <div><span class="label">y</span><input type="number" v-model="selectedObject.y"></div>
        </template>
        
        <div><button v-on:click="update">update</button><button v-on:click="delete">delete</button></div>
      </div>
    </div>
  `,
  props: [
  ],
  methods: {
    update: function() {
      this.$root.updateGameObject(this.selectedObject);
    },
    delete: function() {
      this.$root.deleteGameObject(this.selectedObject);
      this.selectedObject = null;
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
        if (this.$data.selectedObject === intersects[0].object) return;

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
