const axios = require('axios');

export class Volume {
    
    width: number;
    height: number;
    depth: number;
    bitsPerVoxel: number;
    bytesPerLine: number;
    boundingBox: number[];
    data: ArrayBuffer;
    textureFormat: any;

    constructor() {
        return (async (): Promise<Volume> => {
            await this.loadData();
            return this;
          })() as unknown as Volume;
    }

    async loadData() {
        const width = await axios.get('http://localhost:8080/volume/width');
        const height = await axios.get('http://localhost:8080/volume/height');
        const depth = await axios.get('http://localhost:8080/volume/image_count');
        const bitsPerVoxel = await axios.get('http://localhost:8080/volume/bits_per_voxel');
        const bytesPerLine = await axios.get('http://localhost:8080/volume/bytes_per_line');
        const boundingBox = await axios.get('http://localhost:8080/volume/bounding_box');
        const data = await axios.get('http://localhost:8080/volume/data', { responseType: 'arraybuffer' });
        this.width = width.data;
        this.height = height.data;
        this.depth = depth.data;
        this.bitsPerVoxel = bitsPerVoxel.data;
        this.bytesPerLine = bytesPerLine.data;
        this.boundingBox = boundingBox.data;
        this.data = data.data;
        this.findFormat();
    }

    private findFormat() {
        if (this.bitsPerVoxel == 8) 
            this.textureFormat = 'r8unorm';
        else if (this.bitsPerVoxel == 16)
            this.textureFormat = 'rg8unorm';
        else
            console.error('Invalid pixel format for texture.');
    }

    public size() {
        return [this.width, this.height, this.depth];
    }

}