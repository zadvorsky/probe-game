EDITOR.ProbeTool = Vue.extend({
  template: `
    <div>
      <div v-if="probe">
        <number-input :value.sync="probe.thrusterPower" label="thrust"></number-input>
        <number-input :value.sync="probe.angularDamping" label="damping"></number-input>
        <number-input :value.sync="probe.cameraDistanceDefault" label="cam z"></number-input>
        <number-input :value.sync="probe.cameraDistanceSpeedFactor" label="cam z f"></number-input>

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
