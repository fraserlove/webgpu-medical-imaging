import { Context } from './context';
const axios = require('axios');

export class TransferFunction {

    private width: number;
    private noColours: number;
    private colourFormat: string;
    private data: ArrayBuffer;

    constructor() {
        return (async (): Promise<TransferFunction> => {
            await this.loadData();
            return this;
          })() as unknown as TransferFunction;
    }

    async loadData() {
        this.noColours = (await axios.get('http://localhost:8080/transfer_function/size')).data;
        this.data = (await axios.get('http://localhost:8080/transfer_function/data', { responseType: 'arraybuffer' })).data;
        
        let format = (await axios.get('http://localhost:8080/transfer_function/format')).data;
        this.findFormat(format);
    }

    private findFormat(format: string) {
        if (format == 'rgba32f') this.colourFormat = 'rgba32float';
        else console.error('Invalid pixel format for transfer function texture.');
    }

    public setWidth(width): void { this.width = width; }
    public getWidth(): number { return this.width; }
    public size(): number[] { return [this.width, this.noColours / this.width]; }
    public getBytesPerRow(): number { return this.width * 4 * 4; }
    public getRowsPerImage(): number { return this.noColours / this.width; }
    public getColourFormat(): any { return this.colourFormat as any; }
    public getData(): ArrayBuffer { return this.data; }

}