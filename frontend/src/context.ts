import { Volume } from './volume';
import { TransferFunction } from './transferFunction';

export class Context {
    private volume: Volume;
    private transferFunction: TransferFunction;

    private adapter: GPUAdapter;
    private device: GPUDevice;
    private queue: GPUQueue;

    private containers: Map<number, HTMLDivElement>;
    private windows: Map<number, HTMLCanvasElement>;
    private contexts: Map<number, GPUCanvasContext>;

    constructor(volume: Volume, transferFunction: TransferFunction) {
        this.volume = volume;
        this.transferFunction = transferFunction;
        this.containers = new Map<number, HTMLDivElement>();
        this.windows = new Map<number, HTMLCanvasElement>();
        this.contexts = new Map<number, GPUCanvasContext>();
    }

    public getVolume(): Volume { return this.volume; }
    public getTransferFunction(): TransferFunction { return this.transferFunction; }
    public getDevice(): GPUDevice { return this.device; }
    public getQueue(): GPUQueue { return this.queue; }
    public getContainer(id: number): HTMLDivElement { return this.containers.get(id); }
    public getWindow(id: number): HTMLCanvasElement { return this.windows.get(id); }
    public getGPUContext(id: number): GPUCanvasContext { return this.contexts.get(id); }
    public displayFormat(): GPUTextureFormat { return navigator.gpu.getPreferredCanvasFormat(); }

    public newWindow(renderID: number): HTMLCanvasElement {
        let container = document.createElement('div');
        container.id = 'container';
        this.containers.set(renderID, container);

        let window = document.createElement('canvas');
        this.windows.set(renderID, window);

        let context = window.getContext('webgpu');
        context.configure({ device: this.device, format: this.displayFormat(), alphaMode: 'premultiplied' });
        this.contexts.set(renderID, context);
            
        container.appendChild(window);
        document.body.appendChild(container);
        return window;
    }

    public removeWindow(id: number): void {
        this.containers.get(id).remove();
        this.containers.delete(id);
        this.windows.delete(id);
        this.contexts.delete(id);
    }

    public resizeWindow(id: number, size: number[]): void { 
        this.windows.get(id).width = size[0];
        this.windows.get(id).height = size[1];
    }

    public async initWebGPU(): Promise<boolean> {
        console.log('CONTEXT: Initialising WebGPU...');
        try {
            this.adapter = await navigator.gpu.requestAdapter();
            this.device = await this.adapter.requestDevice();
            this.queue = this.device.queue;
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