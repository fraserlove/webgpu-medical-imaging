const convert = require('xml-js');
const fs = require('fs');

export class Volume {
    
    private version: number;
    private width: number;
    private height: number;
    private imageCount: number;
    private bitsPerVoxel: number;
    private bytesPerLine: number;
    private pixelFormat: string;
    private boundingBox: number[];
    private filename: string;

    constructor(path: string) {
        const xml = fs.readFileSync(path, 'utf8');
        const options = {compact: true, textKey: '_'};
        const result = convert.xml2js(xml, options);

        this.version = result['Volume_View']['Version']['_'];
        this.width = result['Volume_View']['Width']['_'];
        this.height = result['Volume_View']['Height']['_'];
        this.imageCount = result['Volume_View']['Image_count']['_'];
        this.bitsPerVoxel = result['Volume_View']['Bits_per_voxel']['_'];
        this.bytesPerLine = result['Volume_View']['Bytes_per_line']['_'];
        this.pixelFormat = result['Volume_View']['Pixel_Format']['_'];
        this.boundingBox = result['Volume_View']['Bounding_box']['_'];
        this.filename = result['Volume_View']['Filename']['_'];   
    }

    public getVersion(): number { return this.version; }
    public getWidth(): number { return this.width; }
    public getHeight(): number { return this.height; }
    public getImageCount(): number { return this.imageCount; }
    public getBitsPerVoxel(): number { return this.bitsPerVoxel; }
    public getBytesPerLine(): number { return this.bytesPerLine; } 
    public getPixelFormat(): string { return this.pixelFormat; }
    public getBoundingBox(): number[] { return this.boundingBox; }
    public getFilename(): string { return this.filename; }

}