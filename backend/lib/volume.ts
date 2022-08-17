export class Volume {
    
    private size: number[];
    private bitsPerVoxel: number;
    private bytesPerLine: number;
    private boundingBox: number[];
    private textureFormat: string;
    private format: string;
    private filename: string;

    constructor(meta: any[]) {
        this.size = [Number(meta['Width']['_']), Number(meta['Height']['_']), Number(meta['Image_count']['_'])];
        this.bitsPerVoxel = Number(meta['Bits_per_voxel']['_']);
        this.bytesPerLine = Number(meta['Bytes_per_line']['_']);
        this.format = meta['Pixel_Format']['_'];
        this.filename = meta['Filename']['_'];   

        let boundingBox = meta['Bounding_box']['_'];
        this.boundingBox = boundingBox.substr(1, boundingBox.length - 5).split(",").map(Number);

        this.findFormat();
    }

    private findFormat(): void {
        if (this.bitsPerVoxel == 8) this.textureFormat = 'r8unorm';
        else if (this.bitsPerVoxel == 16) this.textureFormat = 'rg8unorm';
        else console.error('Invalid pixel format for volume texture.');
    }

    public getFilename(): string { return this.filename; }
    public getFormat(): string { return this.format; }
}