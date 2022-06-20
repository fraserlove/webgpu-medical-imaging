import { Volume } from './volume';
import shader from '../shaders/shader.wgsl';

export const uniformData = new Float32Array([

    // Transformation matrix
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0,
  
    // Canvas width and height
    //windowWidth, windowHeight
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
    canvasTexture: GPUTexture;
    volumeTexture: GPUTexture;
    sampler: GPUSampler;

    bindGroupLayout: GPUBindGroupLayout;
    bindGroup: GPUBindGroup;
    pipeline: GPURenderPipeline;
    
    commandEncoder: GPUCommandEncoder;
    passEncoder: GPURenderPassEncoder;

    constructor(volume, canvas) {
        this.volume = volume;
        this.canvas = canvas;
    }

    async start() {
        console.log('Initialising WebGPU...');
        if (await this.initWebGPU()) {
            console.log('Initialising Resources...');
            this.initResources();
            console.log('Executing Pipeline...');
            this.executePipeline();
            console.log('Done.')
        }
        else {
            console.log('WebGPU support not detected.')
        }
    }

    async initWebGPU(): Promise<boolean> {
        try {
            this.adapter = await navigator.gpu.requestAdapter();
            this.device = await this.adapter.requestDevice();
            this.queue = this.device.queue;
        }
        catch(error) {
            console.error(error);
            return false;
        }
        return true;
    }

    initResources() {
        this.context = this.canvas.getContext('webgpu');
        this.canvasFormat = navigator.gpu.getPreferredCanvasFormat(),
        this.context.configure({
            device: this.device,
            format: this.canvasFormat,
            alphaMode: 'premultiplied'
        });

        this.uniformBuffer = this.device.createBuffer({
            size: uniformData.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        this.sampler = this.device.createSampler({
            magFilter: 'linear',
            minFilter: 'linear'
        });

        this.canvasTexture = this.context.getCurrentTexture();
        this.canvasTextureView = this.canvasTexture.createView();

        this.volumeTexture = this.device.createTexture({
            size: [this.volume.width, this.volume.height, this.volume.depth],
            format: this.volume.textureFormat,
            usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING,
            dimension: '3d'
        });

        const imageDataLayout = {
            offset: 0,
            bytesPerRow: this.volume.bytesPerLine,
            rowsPerImage: this.volume.height
        };

        this.queue.writeTexture({ texture: this.volumeTexture }, this.volume.data, imageDataLayout, this.volume.size());


        this.bindGroupLayout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX,
                    buffer: { type: 'uniform' }
                } as GPUBindGroupLayoutEntry,
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: { sampleType: this.volume.sampleType, viewDimension: '3d' }
                } as GPUBindGroupLayoutEntry,
                {
                    binding: 2,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: { type: 'filtering' }
                } as GPUBindGroupLayoutEntry
            ]
        });
        
        this.bindGroup = this.device.createBindGroup({
            layout: this.bindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: this.uniformBuffer } },
                { binding: 1, resource: this.volumeTexture.createView() },
                { binding: 2, resource: this.sampler }
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
                    {
                        arrayStride: 4 * 3 + 4 * 4,
                        attributes: [
                            {
                                // position
                                shaderLocation: 0,
                                offset: 0,
                                format: 'float32x4' as GPUVertexFormat
                            },
                            {
                                // uv
                                shaderLocation: 1,
                                offset: 4 * 4,
                                format: 'float32x3' as GPUVertexFormat
                            }
                        ]
                    }
                ]
            },
            fragment: {
                module: this.device.createShaderModule({ code: shader }),
                entryPoint: 'frag_main',
                targets: [{ format: this.canvasFormat }]
            }
        });
    }

    executePipeline() {
        this.commandEncoder = this.device.createCommandEncoder();
        this.passEncoder = this.commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: this.canvasTextureView,
                clearValue: [0.0, 0.0, 0.0, 1.0],
                loadOp: 'clear' as GPULoadOp,
                storeOp: 'store' as GPUStoreOp
            }]
        });

        this.passEncoder.setPipeline(this.pipeline);
        this.passEncoder.setBindGroup(0, this.bindGroup);
        this.passEncoder.draw(0);
        this.passEncoder.end();

        this.queue.submit([this.commandEncoder.finish()]);
    }
}