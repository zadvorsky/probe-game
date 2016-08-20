// SETTINGS

const PORT = 3000;
const LEVELS_DIR = '/levels/';

// DEPENDENCIES

var express = require('express');
var bodyParser = require('body-parser');
var jsonfile = require('jsonfile');
var fs = require('fs');
var path = require('path');

// APP SETUP

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

// ROUTES

app.post('/levels', function(req, res) {
  fs.readdir(path.join(__dirname + LEVELS_DIR), function(error, files) {
    if (error) console.log('/levels error', error);
    else res.send(files);
  })
});

app.post('/load', function(req, res) {
  res.sendFile(path.join(__dirname + LEVELS_DIR + req.body.name));
});

app.post('/save', function(req, res) {
  var data = req.body;
  var levelName = data.level_name;
  var levelData = data.level_data;
  var fileName = path.join(__dirname + LEVELS_DIR + levelName + '.json');
  
  jsonfile.writeFile(fileName, levelData, function(error) {
    if (error) console.log('/save error', error);
    else res.send('level saved');
  });
});

// RUN

app.listen(PORT, function() {
  console.log('level editor running on port ' + PORT);
});
