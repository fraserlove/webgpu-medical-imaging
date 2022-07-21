const axios = require('axios');

export class Volume {
    
    private width: number;
    private height: number;
    private depth: number;
    private bitsPerVoxel: number;
    private bytesPerLine: number;
    private boundingBox: number[];
    private data: ArrayBuffer;
    private textureFormat: any;

    constructor() {
        return (async (): Promise<Volume> => {
            await this.loadData();
            return this;
          })() as unknown as Volume;
    }

    async loadData() {
        this.width = (await axios.get('http://localhost:8080/volume/width')).data;
        this.height = (await axios.get('http://localhost:8080/volume/height')).data;
        this.depth = (await axios.get('http://localhost:8080/volume/image_count')).data;
        this.bitsPerVoxel = (await axios.get('http://localhost:8080/volume/bits_per_voxel')).data;
        this.bytesPerLine = (await axios.get('http://localhost:8080/volume/bytes_per_line')).data;
        this.data = (await axios.get('http://localhost:8080/volume/data', { responseType: 'arraybuffer' })).data;

        let boundingBox = (await axios.get('http://localhost:8080/volume/bounding_box')).data;
        this.boundingBox = boundingBox.substr(1, boundingBox.length-2).split(",");;

        this.findFormat();
    }

    private findFormat() {
        if (this.bitsPerVoxel == 8) this.textureFormat = 'r8unorm';
        else if (this.bitsPerVoxel == 16) this.textureFormat = 'rg8unorm';
        else console.error('Invalid pixel format for texture.');
    }

    public getBytesPerLine(): number { return this.bytesPerLine; }
    public getBoundingBox(): number[] { return this.boundingBox; }
    public getData(): ArrayBuffer { return this.data; }
    public getTextureFormat(): any { return this.textureFormat; }
    public getBitsPerVoxel(): number { return this.bitsPerVoxel; }
    public size(): number[] { return [this.width, this.height, this.depth]; }
    public getDepth(): number { return this.depth; }
    public getHeight(): number { return this.height; }
    public volumeDataScale(): number { return this.boundingBox[2] / this.depth; }

}