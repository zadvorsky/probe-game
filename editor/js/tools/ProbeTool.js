EDITOR.ProbeTool = Vue.extend({
  template: `
    <div>
      <div><span class="label">thrust</span><input type="number" v-model="probe.thrusterPower"></div>
      <div><button v-on:click="save">save</button></div>
    </div>
  `,
  props: [
  ],
  methods: {
    save: function() {
      this.$root.saveConfig();
    }
  },
  data: function() {
    return {
      probe: ENGINE.config.probe
    };
  }
});
