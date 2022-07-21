const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');
const { Transform } = require('stream');
const { Volume } = require('./lib/volume');
const { TransferFunction } = require('./lib/transferFunction');

const port = 8080;
const volumePath = path.resolve(process.argv[2]);
const transferFunctionPath = path.resolve(process.argv[3]);
const volume = new Volume(volumePath);
const transferFunction = new TransferFunction(transferFunctionPath);
const app = express();

app.use(express.static(path.resolve(__dirname, '../../frontend/dist')));

app.get('/volume', (req, res) => {
    return res.json(volume);
});

app.get('/volume/width', (req, res) => {
    return res.send(volume.getWidth());
});

app.get('/volume/height', (req, res) => {
    return res.send(volume.getHeight());
});

app.get('/volume/image_count', (req, res) => {
    return res.send(volume.getImageCount());
});

app.get('/volume/bits_per_voxel', (req, res) => {
    return res.send(volume.getBitsPerVoxel());
});

app.get('/volume/bytes_per_line', (req, res) => {
    return res.send(volume.getBytesPerLine());
});

app.get('/volume/format', (req, res) => {
    return res.send(volume.getPixelFormat());
});

app.get('/volume/bounding_box', (req, res) => {
    return res.send(volume.getBoundingBox());
});

function signedToUnsigned(chunk: any) {
    var data = new Uint16Array(chunk.buffer);
    for (var i = 0; i < data.length; i++) {
        // Added 2^15 so values are unsigned ints ranging from 0 to 2^16
        data[i] += 0x8000;
    }
    return new Uint8Array(data.buffer);
}

app.get('/volume/data', (req, res) => {
    var file = path.resolve(volumePath, '../', volume.getFilename());
    if (volume.getPixelFormat() == 'gray16s') {

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

app.get('/transfer_function', (req, res) => {
    return res.json(transferFunction);
});

app.get('/transfer_function/format', (req, res) => {
    return res.send(transferFunction.getPixelFormat());
});

app.get('/transfer_function/size', (req, res) => {
    return res.send(transferFunction.getSize());
});

app.get('/transfer_function/data', (req, res) => {
    var file = path.resolve(transferFunctionPath, '../', transferFunction.getFilename());
    return fs.createReadStream(file).pipe(res);
});

app.get('/', (req, res) => {
    return res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

app.listen(port);
console.log('Server started at http://localhost:' + port);