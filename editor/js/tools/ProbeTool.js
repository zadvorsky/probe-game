EDITOR.ProbeTool = Vue.extend({
  template: `
    <div>
      <div v-if="probe">
        <div><span class="label">thrust</span><input type="number" v-model="probe.thrusterPower" number></div>
        <div><span class="label">damping</span><input type="number" v-model="probe.angularDamping" number></div>
        <div><span class="label">cam z</span><input type="number" v-model="probe.cameraDistanceDefault" number></div>
        <div><span class="label">cam z f</span><input type="number" v-model="probe.cameraDistanceSpeedFactor" number></div>
        <div><button v-on:click="save">save</button></div>
      </div>
    </div>
  `,
  props: [
  ],
  methods: {
    save: function() {
      EDITOR.utils.copy(ENGINE.config.probe, this.$data.probe);
      this.$root.saveConfig();
    }
  },
  data: function() {
    return {
      probe: null
    }
  },
  //watch: {
  //  'probe.thrusterPower': function(n, o) {
  //    console.log('CHANGE', n, o);
  //    ENGINE.config.probe.thrusterPower = n;
  //  }
  //},

  created: function() {
    this.$data.probe = this.$root.engine.probe;
  }
});
