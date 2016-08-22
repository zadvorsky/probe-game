//=require ../../engine/engine.js

console.log('this is editor main.js');


var engine = new Engine();


var levels = [];

function loadLevel(name) {
  var request = new XMLHttpRequest();
  request.open('POST', 'http://localhost:3000/load', true);
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.onload = function(e) {
    console.log('level loaded', JSON.parse(e.target.response));
  };
  request.send(JSON.stringify({name: name}));
}

function loadLevels() {
  var request = new XMLHttpRequest();
  request.open('POST', 'http://localhost:3000/levels', true);
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.onload = function(e) {
    levels = JSON.parse(e.target.response);
    
    console.log('levels loaded', levels);
    
    loadLevel(levels[0]);
  };
  request.send();
}

loadLevels();

function save() {
  var data = {
    level_name: 'level_1',
    level_data: {
      obj_1: {
        vertices: [
          {x: 0, y: 0}
        ]
      }
    }
  };
  
  var request = new XMLHttpRequest();
  request.open('POST', 'http://localhost:3000/save', true);
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.onload = function(e) {
    console.log('ONLOAD', e);
  };
  request.send(JSON.stringify(data));
}
