import { Volume } from './volume';
import { getShader } from './computeShader';

const windowWidth = 512;
const windowHeight = 512;

export const uniformData = new Float32Array([

    // Transformation matrix
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0,
  
    // Canvas width and height
    windowWidth, windowHeight
]);

class VolumeRenderer {
    volume: Volume;

    adapter: GPUAdapter;
    device: GPUDevice;
    queue: GPUQueue;

    canvas: HTMLCanvasElement;
    context: GPUCanvasContext;

    uniformBuffer: GPUBuffer;
    canvasTexture: GPUTexture;
    volumeTexture: GPUTexture;
    sampler: GPUSampler;
    canvasTextureView: GPUTextureView;

    bindGroupLayout: GPUBindGroupLayout;
    bindGroup: GPUBindGroup;
    pipeline: GPUComputePipeline;
    
    commandEncoder: GPUCommandEncoder;
    passEncoder: GPUComputePassEncoder;

    constructor(volume) {
        this.volume = volume;
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
        this.canvas = document.createElement('canvas');
        this.canvas.width = windowWidth;
        this.canvas.height = windowHeight;

        this.context = this.canvas.getContext('webgpu');
        this.context.configure({
            device: this.device,
            format: navigator.gpu.getPreferredCanvasFormat(),
            alphaMode: 'premultiplied',
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
        });

        this.uniformBuffer = this.device.createBuffer({
            size: uniformData.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        this.canvasTexture = this.device.createTexture({
            size: [this.canvas.width, this.canvas.height],
            format: 'r8uint',
            usage: GPUTextureUsage.COPY_SRC | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
            dimension: '2d'
        });

        this.volumeTexture = this.device.createTexture({
            size: [this.volume.width, this.volume.height, this.volume.depth],
            format: this.volume.textureFormat,
            usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING,
            dimension: '3d'
        });

        this.sampler = this.device.createSampler({
            magFilter: 'linear',
            minFilter: 'linear'
        });

        this.bindGroupLayout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: { type: 'uniform' }
                } as GPUBindGroupLayoutEntry,
                {
                    binding: 1,
                    visibility: GPUShaderStage.COMPUTE,
                    texture: { sampleType: this.volume.sampleType, viewDimension: '3d' }
                } as GPUBindGroupLayoutEntry,
                {
                    binding: 2,
                    visibility: GPUShaderStage.COMPUTE,
                    texture: { sampleType: 'uint', viewDimension: '2d' }
                } as GPUBindGroupLayoutEntry,
                {
                    binding: 3,
                    visibility: GPUShaderStage.COMPUTE,
                    sampler: { type: 'filtering' }
                } as GPUBindGroupLayoutEntry
            ]
        });
        
        this.bindGroup = this.device.createBindGroup({
            layout: this.bindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: this.uniformBuffer } },
                { binding: 1, resource: this.volumeTexture.createView() },
                { binding: 2, resource: this.canvasTexture.createView() },
                { binding: 3, resource: this.sampler }
            ]
        });

        this.pipeline = this.device.createComputePipeline({
            layout: this.device.createPipelineLayout({
                bindGroupLayouts: [this.bindGroupLayout]
            }),
            compute: {
                module: this.device.createShaderModule({ code: getShader(this.volume.channelFormat) }),
                entryPoint: 'main'
            }
        });

        const imageDataLayout = {
            offset: 0,
            bytesPerRow: this.volume.bytesPerLine,
            rowsPerImage: this.volume.height
        };
        
        this.queue.writeTexture({ texture: this.volumeTexture }, this.volume.data, imageDataLayout, this.volume.size());
    }

    executePipeline() {
        this.commandEncoder = this.device.createCommandEncoder();
        this.passEncoder = this.commandEncoder.beginComputePass();

        this.passEncoder.setPipeline(this.pipeline);
        this.passEncoder.setBindGroup(0, this.bindGroup);
        this.passEncoder.dispatchWorkgroups(this.canvas.width, this.canvas.height);
        this.passEncoder.end();

        this.queue.submit([this.commandEncoder.finish()]);
    }
}

async function main() {
    const volume = await new Volume();
    const volumeRenderer = new VolumeRenderer(volume);
    volumeRenderer.start();
}

main()
