EDITOR.LevelsTool = Vue.extend({
  template: `
    <button v-on:click="save">save</button>
    <button v-on:click="clear">clear</button>
    <div>
      <input type="text" v-model="newLevelName">
      <button v-on:click="create">new</button>  
    </div>
    <div>
      <div v-for="level in levels" v-on:click="load(level)">{{ level }}</div>
    </div>
  `,
  methods: {
    clear: function() {
      this.$root.clearLevel();
    },
    save: function() {
      this.$root.saveLevel();
    },
    create: function() {
      this.$root.createLevel(this.newLevelName);
    },
    load: function(name) {
      this.$root.loadLevel(name);
    }
  },
  data: function() {
    return {
      newLevelName: '',
      levels: []
    };
  },
  
  created: function() {
    this.levels = this.$root.levels;
    
    console.log(this.levels);
  },
  ready: function() {},
  beforeDestroy: function() {}
});
