var convert = require('xml-js');
var fs = require('fs');

export class Volume {
    
    version: number;
    width: number;
    height: number;
    imageCount: number;
    bitsPerVoxel: number;
    bytesPerLine: number;
    pixelFormat: string;
    boundingBox: number[];
    filename: string;

    constructor(file: string) {
        var xml = fs.readFileSync('./res/' + file + '.xml', 'utf8');
        var options = {compact: true, nativeType: true, textKey: '_'};
        var result = convert.xml2js(xml, options);

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
}