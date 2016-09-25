EDITOR.TargetTool = Vue.extend({
  template: '<div></div>',

  methods: {},

  ready: function() {
    this.cursor = new EDITOR.Cursor(0.2);
    this.$root.zPlane.setCursor(this.cursor);

    this.$root.engine.container.style.cursor = 'crosshair';

    this.mouseClickHandler = function(e) {
      if (e.which !== 1) return;

      var target = new ENGINE.Target(this.cursor.position);
      
      this.$root.engine.add(target);
      this.$root.storeGameObject(target);
    }.bind(this);

    this.$root.engine.container.addEventListener('click', this.mouseClickHandler);
  },
  beforeDestroy: function() {
    this.$root.zPlane.setCursor(null);
    this.$root.engine.container.style.cursor = '';
    this.$root.engine.container.removeEventListener('click', this.mouseClickHandler);
  }
});
