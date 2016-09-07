// SETTINGS

const PORT = 3000;
const LEVELS_DIR = __dirname + '/levels/';

// DEPENDENCIES

var express = require('express');
var bodyParser = require('body-parser');
var jsonfile = require('jsonfile');
var fs = require('fs');
var path = require('path');

// APP SETUP

var app = express();
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({extended: true, limit: '50mb'}));
app.use(express.static('bin'));

// ROUTES

app.post('/levels', function(req, res) {
  fs.readdir(path.join(LEVELS_DIR), function(error, files) {
    if (error) console.log('/levels error', error);
    else res.send(files);
  })
});

app.post('/load', function(req, res) {
  res.sendFile(path.join(LEVELS_DIR + req.body.name));
});

app.post('/save', function(req, res) {
  var data = req.body;
  var levelName = data.name;
  var levelData = data;
  var fileName = path.join(LEVELS_DIR + levelName + '.json');
  
  jsonfile.writeFile(fileName, levelData, {spaces: 2}, function(error) {
    if (error) console.log('/save error', error);
    else res.send('level saved');
  });
});

app.post('/loadConfig', function(req, res) {
  res.sendFile(path.join(__dirname + '/engine/config.json'));
});

app.post('/saveConfig', function(req, res) {
  var fileName = path.join(__dirname + '/engine/config.json');

  jsonfile.writeFile(fileName, req.body, {spaces: 2}, function(error) {
    if (error) console.log('/saveConfig error', error);
    else res.send('config saved');
  });
});


// do we need this?
//app.post('/delete', function(req, res) {
//  fs.unlink(path.join(LEVELS_DIR + req.body.name), function(error) {
//    if (error) console.log('/delete error', error);
//    else res.send('level deleted');
//  });
//});

// RUN

app.listen(PORT, function() {
  console.log('level editor running on port ' + PORT);
});
