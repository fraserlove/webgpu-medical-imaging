var http = require('http');
var volume = require('./lib/volume');
var fs = require('fs');
var path = require('path');
var express = require('express');

var volume = new volume.Volume('Volume_ce4cdea10ce4bb0d2d697e32b05dfa0e');
var app = express();

app.use(express.static(path.resolve(__dirname, '../../frontend/dist')));
var server = app.listen(8080);