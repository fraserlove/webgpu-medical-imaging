import { Volume } from './volume';

export class Context {
    private volume: Volume;

    private adapter: GPUAdapter;
    private device: GPUDevice;
    private queue: GPUQueue;

    private canvas: HTMLCanvasElement;
    private context: GPUCanvasContext;
    private canvasFormat: GPUTextureFormat;

    constructor(volume: Volume, width: number, height: number) {
        this.volume = volume;
        this.canvas = document.createElement('canvas');
        document.body.appendChild(this.canvas);
        this.canvas.width = width;
        this.canvas.height = height;
    }

    public getVolume(): Volume { return this.volume; }
    public getDevice(): GPUDevice { return this.device; }
    public getQueue(): GPUQueue { return this.queue; }
    public getCanvas(): HTMLCanvasElement { return this.canvas; }
    public getCanvasContext(): GPUCanvasContext { return this.context; }
    public size(): number[] { return [this.canvas.width, this.canvas.height]; }
    public displayFormat(): GPUTextureFormat { return this.canvasFormat; }

    public resize(width: number, height: number): void {
        this.canvas.width = width;
        this.canvas.height = height;
    }

    public async initWebGPU(): Promise<boolean> {
        console.log('CONTEXT: Initialising WebGPU...');
        try {
            this.adapter = await navigator.gpu.requestAdapter();
            this.device = await this.adapter.requestDevice();
            this.queue = this.device.queue;

            this.context = this.canvas.getContext('webgpu');
            this.canvasFormat = navigator.gpu.getPreferredCanvasFormat(),
            this.context.configure({
                device: this.device,
                format: this.canvasFormat,
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