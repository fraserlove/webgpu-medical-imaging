const convert = require('xml-js');
const fs = require('fs');

export class TransferFunction {
    
    private version: number;
    private pixelFormat: string;
    private size: number;
    private filename: string;

    constructor(path: string) {
        const xml = fs.readFileSync(path, 'utf8');
        const options = {compact: true, textKey: '_'};
        const result = convert.xml2js(xml, options);

        this.version = result['Transfer_Function']['Version']['_'];
        this.pixelFormat = result['Transfer_Function']['Pixel_Format']['_'];
        this.size = result['Transfer_Function']['Size']['_'];
        this.filename = result['Transfer_Function']['Filename']['_'];   
    }

    public getVersion(): number { return this.version; }
    public getSize(): number { return this.size; }
    public getPixelFormat(): string { return this.pixelFormat; }
    public getFilename(): string { return this.filename; }
    
}