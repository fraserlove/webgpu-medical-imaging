var http = require('http');
var VolumeMeta = require('./lib/volumeMeta').VolumeMeta;
var fs = require('fs');
var path = require('path');
var express = require('express');
const { Transform } = require('stream');

var port = 8080;
var metaPath = path.resolve(process.argv[2]);
var volume = new VolumeMeta(metaPath);
var app = express();

app.use(express.static(path.resolve(__dirname, '../../frontend/dist')));

app.get('/volume/width', (req, res) => {
    return res.send(volume.width);
});

app.get('/volume/height', (req, res) => {
    return res.send(volume.height);
});

app.get('/volume/image_count', (req, res) => {
    return res.send(volume.imageCount);
});

app.get('/volume/bits_per_voxel', (req, res) => {
    return res.send(volume.bitsPerVoxel);
});

app.get('/volume/bytes_per_line', (req, res) => {
    return res.send(volume.bytesPerLine);
});

app.get('/volume/format', (req, res) => {
    return res.send(volume.pixelFormat);
});

app.get('/volume/bounding_box', (req, res) => {
    return res.send(volume.boundingBox);
});

function signedToUnsigned(chunk: any) {
    var signedData = new Int16Array(chunk.buffer);
    var unsignedData = new Uint16Array(signedData.length);
    for (var i = 0; i < signedData.length; i++) {
        unsignedData[i] = signedData[i] + 2 ** 16;
    }
    //console.log('Signed:' + signedData[signedData.length - 1]);
    //console.log('Unsigned:' + unsignedData[signedData.length - 1]);
    return new Uint8Array(unsignedData.buffer);
}

app.get('/volume/data', (req, res) => {
    var file = path.resolve(metaPath, '../', volume.filename);
    if (volume.pixelFormat == 'gray16s') {

        const transformStream = new Transform();

        transformStream._transform = (chunk, encoding, callback) => {
            transformStream.push(signedToUnsigned(chunk));
            callback();
        };

        fs.createReadStream(file).pipe(transformStream).pipe(res);
    }
    else {
        return fs.createReadStream(file).pipe(res);
    }
});

app.get('/volume', (req, res) => {
    return res.json(volume);
});

app.get('/', (req, res) => {
    return res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

app.listen(port);
console.log('Server started at http://localhost:' + port);