const axios = require('axios');

export class TransferFunction {
    
    private size: number;
    private colourFormat: string;
    private data: ArrayBuffer;

    constructor() {
        return (async (): Promise<TransferFunction> => {
            await this.loadData();
            return this;
          })() as unknown as TransferFunction;
    }

    async loadData() {
        this.size = (await axios.get('http://localhost:8080/transfer_function/size')).data;
        this.colourFormat = (await axios.get('http://localhost:8080/transfer_function/format')).data;
        this.data = (await axios.get('http://localhost:8080/transfer_function/data', { responseType: 'arraybuffer' })).data;
    }

    public getSize(): number { return this.size; }
    public getColourFormat(): any { return this.colourFormat; }
    public getData(): ArrayBuffer { return this.data; }

}