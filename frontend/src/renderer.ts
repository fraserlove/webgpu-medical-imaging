import { Volume } from './volume';
import shader from '../shaders/shader.wgsl';

export const uniformData = new Float32Array([

    // Transformation matrix
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0,
]);

export class VolumeRenderer {
    volume: Volume;

    adapter: GPUAdapter;
    device: GPUDevice;
    queue: GPUQueue;

    canvas: HTMLCanvasElement;
    context: GPUCanvasContext;
    canvasFormat: GPUTextureFormat;
    canvasTextureView: GPUTextureView;

    uniformBuffer: GPUBuffer;
    verticesBuffer: GPUBuffer;
    canvasTexture: GPUTexture;
    volumeTexture: GPUTexture;
    sampler: GPUSampler;

    bindGroupLayout: GPUBindGroupLayout;
    bindGroup: GPUBindGroup;
    pipeline: GPURenderPipeline;
    
    commandEncoder: GPUCommandEncoder;
    passEncoder: GPURenderPassEncoder;
    renderPassDescriptor: GPURenderPassDescriptor;

    constructor(volume, canvas) {
        this.volume = volume;
        this.canvas = canvas;
    }

    public async start() {
        console.log('Initialising WebGPU...');
        if (await this.initWebGPU()) {
            console.log('Creating pipeline...');
            this.createPipeline();
            console.log('Initialising Resources...');
            this.initResources();
            console.log('Executing Pipeline...');
        }
        else {
            console.log('WebGPU support not detected.')
        }
    }

    private async initWebGPU(): Promise<boolean> {
        try {
            this.adapter = await navigator.gpu.requestAdapter();
            this.device = await this.adapter.requestDevice();
            this.queue = this.device.queue;

            this.context = this.canvas.getContext('webgpu');
            this.canvasFormat = 'rgba16float', //navigator.gpu.getPreferredCanvasFormat(),
            this.context.configure({
                device: this.device,
                format: this.canvasFormat,
                alphaMode: 'premultiplied'
            });

            this.renderPassDescriptor = {
                colorAttachments: [{
                    view: undefined, // set in render loop
                    clearValue: [0.0, 0.0, 0.0, 1.0],
                    loadOp: 'clear' as GPULoadOp,
                    storeOp: 'store' as GPUStoreOp
                }]
            }
        }
        catch(error) {
            console.error(error);
            return false;
        }
        return true;
    }

    private createPipeline() {
        this.bindGroupLayout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: { type: 'uniform' }
                } as GPUBindGroupLayoutEntry,
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: { sampleType: 'float', viewDimension: '3d' }
                } as GPUBindGroupLayoutEntry,
                {
                    binding: 2,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: { type: 'filtering' }
                } as GPUBindGroupLayoutEntry
            ]
        });

        this.pipeline = this.device.createRenderPipeline({
            layout: this.device.createPipelineLayout({
                bindGroupLayouts: [this.bindGroupLayout]
            }),
            vertex: {
                module: this.device.createShaderModule({ code: shader }),
                entryPoint: 'vert_main',
                buffers: [
                ]
            },
            fragment: {
                module: this.device.createShaderModule({ code: shader }),
                entryPoint: 'frag_main',
                targets: [{ format: this.canvasFormat }]
            }
        });
    }

    private initResources() {
        this.uniformBuffer = this.device.createBuffer({
            size: uniformData.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        this.sampler = this.device.createSampler({
            magFilter: 'linear',
            minFilter: 'linear'
        });

        this.volumeTexture = this.device.createTexture({
            size: [this.volume.width, this.volume.height, this.volume.depth],
            format: 'r16float',
            usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING,
            dimension: '3d'
        });

        const imageDataLayout = {
            offset: 0,
            bytesPerRow: this.volume.bytesPerLine,
            rowsPerImage: this.volume.height
        };

        this.queue.writeTexture({ texture: this.volumeTexture }, this.volume.data, imageDataLayout, this.volume.size());
        
        
        this.bindGroup = this.device.createBindGroup({
            layout: this.bindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: this.uniformBuffer } },
                { binding: 1, resource: this.volumeTexture.createView() },
                { binding: 2, resource: this.sampler }
            ]
        });
    }

    public executePipeline() {
        this.renderPassDescriptor.colorAttachments[0].view = this.context.getCurrentTexture().createView();

        this.commandEncoder = this.device.createCommandEncoder();
        this.passEncoder = this.commandEncoder.beginRenderPass(this.renderPassDescriptor);
        this.passEncoder.setPipeline(this.pipeline);
        this.passEncoder.setBindGroup(0, this.bindGroup);
        this.passEncoder.draw(0);
        this.passEncoder.end();

        this.queue.submit([this.commandEncoder.finish()]);
    }
}