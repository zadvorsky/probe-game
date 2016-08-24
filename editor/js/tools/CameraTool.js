EDITOR.CameraTool = Vue.extend({
  template: '<button v-on:click="reset">reset</button>',

  methods: {
    reset: function () {
      this.$root.controls.object.position.set(0, 0, 20);
      this.$root.controls.update();
    }
  },

  created: function() {},
  ready: function() {
    this.$root.controls.enableRotate = true;
  },
  beforeDestroy: function() {
    this.$root.controls.enableRotate = false;
  }
});
