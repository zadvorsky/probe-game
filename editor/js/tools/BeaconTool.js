EDITOR.BeaconTool = Vue.extend({
  template: '<div></div>',

  methods: {},

  ready: function() {
    var engine = this.$root.engine;
    var plane = this.$root.zPlane;

    this.cursor = new EDITOR.Cursor(0.2);
    engine.add(this.cursor, false);

    engine.container.style.cursor = 'crosshair';

    this.mouseClickHandler = function(e) {
      if (e.which !== 1) return;

      var beacon = new ENGINE.Beacon(this.cursor.position);
      
      this.$root.engine.add(beacon);
      this.$root.storeGameObject(beacon);
    }.bind(this);

    engine.container.addEventListener('click', this.mouseClickHandler);

    var update = function() {
      var intersects = this.$root.intersect(plane);

      if (intersects && intersects.length) {
        var p = intersects[0].point;

        plane.snapPoint(p);

        this.cursor.position.copy(p);
      }

      this.rafid = requestAnimationFrame(update);
    }.bind(this);

    update();
  },
  beforeDestroy: function() {
    this.$root.engine.container.style.cursor = '';

    this.$root.engine.remove(this.cursor);
    this.$root.engine.container.removeEventListener('click', this.mouseClickHandler);

    cancelAnimationFrame(this.rafid);
  }
});
