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
    channelFormat: any;
    sampleType: any;

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
        const format = await axios.get('http://localhost:8080/volume/format');
        const boundingBox = await axios.get('http://localhost:8080/volume/bounding_box');
        const data = await axios.get('http://localhost:8080/volume/data', { responseType: 'arraybuffer' });
        this.width = width.data;
        this.height = height.data;
        this.depth = depth.data;
        this.bitsPerVoxel = bitsPerVoxel.data;
        this.bytesPerLine = bytesPerLine.data;
        this.boundingBox = boundingBox.data;
        this.data = data.data;
        this.findFormat(format.data);
    }

    private findFormat(format) {
        if (format == 'gray8') {
            this.textureFormat = 'r8uint';
            this.channelFormat = 'u32';
            this.sampleType = 'uint';
        }
        else if (format == 'gray16') {
            this.textureFormat = 'r16uint';
            this.channelFormat = 'u32';
            this.sampleType = 'uint';
        }
        else if (format == 'gray16s') {
            this.textureFormat = 'r16sint';
            this.channelFormat = 'i32';
            this.sampleType = 'sint';
        }
        else
            console.error('Invalid pixel format for texture.');
    }

    public size() {
        return [this.width, this.height, this.depth];
    }

}