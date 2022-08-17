const fs = require('fs');
const convert = require('xml-js');
const path = require('path');
const express = require('express');
const { Transform } = require('stream');
import { Volume } from "./lib/volume";
import { TransferFunction } from "./lib/transferFunction";

export class Server {

    private app: any;
    private port: number;
    private resFolder: string;
    private resPath: string;
    private volumes: Volume[];
    private transferFunctions: TransferFunction[];

    constructor() {
        this.app = express();
        this.port = 8080;
        this.resFolder = path.resolve(process.argv[2]);
        this.resPath = path.resolve(__dirname, '../', this.resFolder);
        this.volumes = [];
        this.transferFunctions = [];

        this.readResources();
    }

    private readResources(): void {
        fs.readdir(this.resPath, (err, filenames) => {
            filenames.forEach((filename) => {
                if (filename.split('.').pop() == 'xml') {
                    let file = path.resolve(this.resPath, filename);
                    let xml = fs.readFileSync(file, 'utf8');
                    let meta = convert.xml2js(xml, {compact: true, textKey: '_'});
                    if ('Volume_View' in meta) this.volumes.push(new Volume(meta['Volume_View']));
                    else if ('Transfer_Function' in meta) this.transferFunctions.push(new TransferFunction(meta['Transfer_Function']));
                }
            });
            this.setup();
            this.start();
        });
    }

    private setup(): void {
        this.app.use(express.static(path.resolve(__dirname, '../../frontend/dist')));

        this.app.get('/volumes', (req, res) => {
            return res.json(this.volumes);
        });
        
        this.app.get('/transfer_functions', (req, res) => {
            return res.json(this.transferFunctions);
        });

        for (let i = 0; i < this.volumes.length; i++) {
            this.app.get('/volume/' + this.volumes[i].getFilename(), (req, res) => {
                var file = path.resolve(this.resPath, this.volumes[i].getFilename());
                if (this.volumes[i].getFormat() == 'gray16s') {

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
        }

        for (let i = 0; i < this.transferFunctions.length; i++) {
            this.app.get('/transfer_function/' + this.transferFunctions[i].getFilename(), (req, res) => {
                var file = path.resolve(this.resPath, this.transferFunctions[i].getFilename());
                return fs.createReadStream(file).pipe(res);
            });
        }

        this.app.get('/', (req, res) => {
            return res.sendFile(path.join(__dirname, '../../frontend/index.html'));
        });
    }

    private start(): void {
        this.app.listen(this.port);
        console.log('Server started at http://localhost:' + this.port);
    }

}

function signedToUnsigned(chunk: any) {
    var data = new Uint16Array(chunk.buffer);
    for (var i = 0; i < data.length; i++) {
        data[i] += 0x8000; // Added 2^15 so values are unsigned ints ranging from 0 to 2^16
    }
    return new Uint8Array(data.buffer);
}

let server = new Server();