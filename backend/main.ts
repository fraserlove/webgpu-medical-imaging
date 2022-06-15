var http = require('http');
var volume = require('./lib/volume');
var fs = require('fs');
var path = require('path');
var express = require('express');

var volume = new volume.Volume('Volume_ce879dc4b13afbf761f38b8ccd8ff764');
var app = express();

app.use(express.static(path.resolve(__dirname, '../../frontend/dist')));
var server = app.listen(8080);