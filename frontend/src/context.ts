import { Volume } from './volume';
import { TransferFunction } from './transferFunction';

export class Context {
    private volume: Volume;
    private transferFunction: TransferFunction;

    private adapter: GPUAdapter;
    private device: GPUDevice;
    private queue: GPUQueue;

    private window: HTMLCanvasElement;
    private context: GPUCanvasContext;

    constructor(volume: Volume, transferFunction: TransferFunction) {
        this.volume = volume;
        this.transferFunction = transferFunction;
        this.window = document.createElement('canvas');
        document.body.appendChild(this.window);
    }

    public getVolume(): Volume { return this.volume; }
    public getTransferFunction(): TransferFunction { return this.transferFunction; }
    public getDevice(): GPUDevice { return this.device; }
    public getQueue(): GPUQueue { return this.queue; }
    public getWindow(): HTMLCanvasElement { return this.window; }
    public getGPUContext(): GPUCanvasContext { return this.context; }
    public displayFormat(): GPUTextureFormat { return navigator.gpu.getPreferredCanvasFormat(); }

    public resize(size: number[]): void { 
        this.window.width = size[0];
        this.window.height = size[1];
    }
    
    public async initWebGPU(): Promise<boolean> {
        console.log('CONTEXT: Initialising WebGPU...');
        try {
            this.adapter = await navigator.gpu.requestAdapter();
            this.device = await this.adapter.requestDevice();
            this.queue = this.device.queue;

            this.context = this.window.getContext('webgpu');
            this.context.configure({
                device: this.device,
                format: this.displayFormat(),
                alphaMode: 'premultiplied'
            });
        }
        catch(error) {
            console.error(error);
            console.log('CONTEXT: WebGPU Not Supported.');
            return false;
        }
        console.log('CONTEXT: Initialised WebGPU.');
        return true;
    }
}