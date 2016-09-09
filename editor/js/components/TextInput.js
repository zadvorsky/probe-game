EDITOR.TextInput = Vue.extend({
  template: `
    <div class="input">
      <span class="label">{{ label }}</span><input type="text" v-model="value" v-on:focus="focus">
    </div>
  `,
  props: ['label', 'value'],
  methods: {
    focus: function() {
      this.$el.querySelector('input').select();
    }
  }
});

Vue.component('text-input', EDITOR.TextInput);
