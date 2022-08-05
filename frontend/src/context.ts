import { Volume } from './volume';
import { TransferFunction } from './transferFunction';

export class Context {
    private volume: Volume;
    private transferFunction: TransferFunction;

    private adapter: GPUAdapter;
    private device: GPUDevice;
    private queue: GPUQueue;

    private windows: HTMLCanvasElement[];
    private contexts: GPUCanvasContext[];

    constructor(volume: Volume, transferFunction: TransferFunction) {
        this.volume = volume;
        this.transferFunction = transferFunction;
        this.windows = [];
        this.contexts = [];
    }

    public getVolume(): Volume { return this.volume; }
    public getTransferFunction(): TransferFunction { return this.transferFunction; }
    public getDevice(): GPUDevice { return this.device; }
    public getQueue(): GPUQueue { return this.queue; }
    public getWindow(idx: number): HTMLCanvasElement { return this.windows[idx]; }
    public getGPUContext(idx: number): GPUCanvasContext { return this.contexts[idx]; }
    public displayFormat(): GPUTextureFormat { return navigator.gpu.getPreferredCanvasFormat(); }

    public newWindow(): HTMLCanvasElement {
        let window = document.createElement('canvas');
        this.windows.push(window);
        document.body.appendChild(window);
        return window;
    }

    public resizeWindow(idx: number, size: number[]): void { 
        this.windows[idx].width = size[0];
        this.windows[idx].height = size[1];
    }

    public async initWebGPU(): Promise<boolean> {
        console.log('CONTEXT: Initialising WebGPU...');
        try {
            this.adapter = await navigator.gpu.requestAdapter();
            this.device = await this.adapter.requestDevice();
            this.queue = this.device.queue;

            for (let i = 0; i < this.windows.length; i++) { 
                let context = this.windows[i].getContext('webgpu');
                context.configure({
                    device: this.device,
                    format: this.displayFormat(),
                    alphaMode: 'premultiplied'
                });
                this.contexts.push(context);
             }
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