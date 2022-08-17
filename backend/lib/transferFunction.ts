export class TransferFunction {
    
    private noColours: number;
    private colourFormat: string;
    private filename: string;

    constructor(meta: any[]) {
        this.noColours = Number(meta['Size']['_']);
        this.filename = meta['Filename']['_']; 
        
        this.findFormat(meta['Pixel_Format']['_']);
    }

    private findFormat(format: string) {
        if (format == 'rgba32f') this.colourFormat = 'rgba32float';
        else console.error('Invalid pixel format for transfer function texture.');
    }

    public getFilename(): string { return this.filename; }

}