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

    public getVolume() { return this.volume; }
    public getDevice() { return this.device; }
    public getQueue() { return this.queue; }
    public getCanvas() { return this.canvas; }
    public getCanvasContext() { return this.context; }
    public size() { return [this.canvas.width, this.canvas.height]; }
    public displayFormat() { return this.canvasFormat; }

    public resize(width: number, height: number) {
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