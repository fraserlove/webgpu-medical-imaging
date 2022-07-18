import { Volume } from './volume';
import { projectionPlane } from './vertices';
import { Camera } from './camera';
import sample from '../shaders/sample.wgsl';
import mip16 from '../shaders/mip16.wgsl';
import mip8 from '../shaders/mip8.wgsl';

export class VolumeRenderer {
    volume: Volume;
    camera: Camera;

    wWidth: number;
    wLevel: number;
    noWorkgroups: number[];
    mipShader: any;

    adapter: GPUAdapter;
    device: GPUDevice;
    queue: GPUQueue;

    canvas: HTMLCanvasElement;
    context: GPUCanvasContext;
    canvasFormat: GPUTextureFormat;

    renderUniformBuffer: GPUBuffer;
    mipUniformBuffer: GPUBuffer;
    vertexBuffer: GPUBuffer;
    mipOutputTexture: GPUTexture;
    volumeTexture: GPUTexture;
    sampler: GPUSampler;

    renderBindGroupLayout: GPUBindGroupLayout;
    mipBindGroupLayout: GPUBindGroupLayout;
    renderBindGroup: GPUBindGroup;
    mipBindGroup: GPUBindGroup;
    renderPipeline: GPURenderPipeline;
    mipPipeline: GPURenderPipeline;
    
    commandEncoder: GPUCommandEncoder;
    renderPassDescriptor: GPURenderPassDescriptor;

    blockDims = [8, 8];  // Must be same as workgroup size in mip shader

    constructor(volume, width, height) {
        this.volume = volume;

        this.canvas = document.createElement('canvas');
        document.body.appendChild(this.canvas);
        this.canvas.width = width;
        this.canvas.height = height;

        //Set last argument to this.volume.boundingBox when implemented correct scaling in z-axis
        this.camera = new Camera(this.canvas.width, this.canvas.height, this.volume.size());

        this.noWorkgroups = [Math.ceil(this.canvas.width / this.blockDims[0]), Math.ceil(this.canvas.height / this.blockDims[1])]

        this.mipShader = mip16
        if (this.volume.bitsPerVoxel == 8)
            this.mipShader = mip8
            
    }

    public async start() {
        console.log('Initialising WebGPU...');
        if (await this.initWebGPU()) {
            console.log('Creating pipelines...');
            this.createPipelines();
            console.log('Initialising Resources...');
            this.initResources();
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
            this.canvasFormat = navigator.gpu.getPreferredCanvasFormat(),
            this.context.configure({
                device: this.device,
                format: this.canvasFormat,
                alphaMode: 'premultiplied'
            });
        }
        catch(error) {
            console.error(error);
            return false;
        }
        return true;
    }

    private createPipelines() {
        this.renderBindGroupLayout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: { type: 'uniform' }
                } as GPUBindGroupLayoutEntry,
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: { sampleType: 'float', viewDimension: '2d' }
                } as GPUBindGroupLayoutEntry,
                {
                    binding: 2,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: { type: 'filtering' }
                } as GPUBindGroupLayoutEntry
            ]
        });

        this.mipBindGroupLayout = this.device.createBindGroupLayout({
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
            ]
        });

        this.renderPipeline = this.device.createRenderPipeline({
            layout: this.device.createPipelineLayout({
                bindGroupLayouts: [this.renderBindGroupLayout]
            }),
            vertex: {
                module: this.device.createShaderModule({ code: sample }),
                entryPoint: 'vert_main',
                buffers: [
                        {
                        arrayStride: projectionPlane.vertexSize,
                        attributes: [
                            {
                                // Position
                                shaderLocation: 0,
                                offset: projectionPlane.positionOffset,
                                format: 'float32x2',
                            },
                            {
                                // UV
                                shaderLocation: 1,
                                offset: projectionPlane.UVOffset,
                                format: 'float32x2',
                            },
                        ]
                    } as GPUVertexBufferLayout
                ]
            },
            fragment: {
                module: this.device.createShaderModule({ code: sample }),
                entryPoint: 'frag_main',
                targets: [{ format: this.canvasFormat }]
            }
        });

        this.mipPipeline = this.device.createRenderPipeline({
            layout: this.device.createPipelineLayout({
                bindGroupLayouts: [this.mipBindGroupLayout]
            }),
            vertex: {
                module: this.device.createShaderModule({ code: this.mipShader }),
                entryPoint: 'vert_main',
                buffers: [
                        {
                        arrayStride: projectionPlane.vertexSize,
                        attributes: [
                            {
                                // Position
                                shaderLocation: 0,
                                offset: projectionPlane.positionOffset,
                                format: 'float32x2',
                            },
                            {
                                // UV
                                shaderLocation: 1,
                                offset: projectionPlane.UVOffset,
                                format: 'float32x2',
                            },
                        ]
                    } as GPUVertexBufferLayout
                ]
            },
            fragment: {
                module: this.device.createShaderModule({ code: this.mipShader }),
                entryPoint: 'frag_main',
                targets: [{ format: this.volume.textureFormat }]
            }
        });
    }

    private initResources() {
        this.renderUniformBuffer = this.device.createBuffer({
            size: this.camera.getWWidthLevel().byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        this.mipUniformBuffer = this.device.createBuffer({
            size: this.camera.getViewMatrix().byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        this.vertexBuffer = this.device.createBuffer({
            size: projectionPlane.vertices.byteLength,
            usage: GPUBufferUsage.VERTEX,
            mappedAtCreation: true
        });
        new Float32Array(this.vertexBuffer.getMappedRange()).set(projectionPlane.vertices);
        this.vertexBuffer.unmap();

        this.sampler = this.device.createSampler({
            magFilter: 'linear',
            minFilter: 'linear'
        });

        this.volumeTexture = this.device.createTexture({
            size: [this.volume.width, this.volume.height, this.volume.depth],
            // rg8unorm or r8unorm - red(low bits), green(high bits)
            format: this.volume.textureFormat,
            usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING,
            dimension: '3d'
        });

        this.mipOutputTexture = this.device.createTexture({
            size: [this.canvas.width, this.canvas.height],
            format: this.volume.textureFormat,
            usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT
        });

        const imageDataLayout = {
            offset: 0,
            bytesPerRow: this.volume.bytesPerLine,
            rowsPerImage: this.volume.height
        };

        this.queue.writeTexture({ texture: this.volumeTexture }, this.volume.data, imageDataLayout, this.volume.size());
        this.queue.writeBuffer(this.renderUniformBuffer, 0, this.camera.getWWidthLevel());
        this.queue.writeBuffer(this.mipUniformBuffer, 0, this.camera.getViewMatrix());
       
        this.renderBindGroup = this.device.createBindGroup({
            layout: this.renderBindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: this.renderUniformBuffer } },
                { binding: 1, resource: this.mipOutputTexture.createView() },
                { binding: 2, resource: this.sampler }
            ]
        });

        this.mipBindGroup = this.device.createBindGroup({
            layout: this.mipBindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: this.mipUniformBuffer } },
                { binding: 1, resource: this.volumeTexture.createView() }
            ]
        });

        this.renderPassDescriptor = {
            colorAttachments: [{
                view: undefined, // set in render loop
                clearValue: [0.0, 0.0, 0.0, 1.0],
                loadOp: 'clear' as GPULoadOp,
                storeOp: 'store' as GPUStoreOp
            }]
        };
    }

    private executeMIPPipeline() {
        this.renderPassDescriptor.colorAttachments[0].view = this.mipOutputTexture.createView();
        const passEncoder = this.commandEncoder.beginRenderPass(this.renderPassDescriptor);
        passEncoder.setPipeline(this.mipPipeline);
        this.queue.writeBuffer(this.mipUniformBuffer, 0, this.camera.getViewMatrix());
        passEncoder.setBindGroup(0, this.mipBindGroup);
        passEncoder.setVertexBuffer(0, this.vertexBuffer);
        passEncoder.draw(projectionPlane.vertexCount);
        passEncoder.end();
    }

    private executeRenderPipeline() {
        this.renderPassDescriptor.colorAttachments[0].view = this.context.getCurrentTexture().createView();
        const passEncoder = this.commandEncoder.beginRenderPass(this.renderPassDescriptor);
        passEncoder.setPipeline(this.renderPipeline);
        this.queue.writeBuffer(this.renderUniformBuffer, 0, this.camera.getWWidthLevel());
        passEncoder.setBindGroup(0, this.renderBindGroup);
        passEncoder.setVertexBuffer(0, this.vertexBuffer);
        passEncoder.draw(projectionPlane.vertexCount);
        passEncoder.end();
    }

    public render() {
        this.commandEncoder = this.device.createCommandEncoder();
        this.executeMIPPipeline();
        this.executeRenderPipeline();
        this.queue.submit([this.commandEncoder.finish()]);
    }

    private resizeOutputTexture() {
        // Called exclusively with resizeCanvas() when user resizes browser window
        this.mipOutputTexture = this.device.createTexture({
            size: [this.canvas.width, this.canvas.height],
            format: this.volume.textureFormat,
            usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT
        });

        this.renderBindGroup = this.device.createBindGroup({
            layout: this.renderBindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: this.renderUniformBuffer } },
                { binding: 1, resource: this.mipOutputTexture.createView() },
                { binding: 2, resource: this.sampler }
            ]
        });

        this.mipBindGroup = this.device.createBindGroup({
            layout: this.mipBindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: this.mipUniformBuffer } },
                { binding: 1, resource: this.volumeTexture.createView() }
            ]
        });
    }

    public resizeCanvas(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.camera.resize(this.canvas.width, this.canvas.height);
        this.noWorkgroups = [Math.ceil(this.canvas.width / this.blockDims[0]), Math.ceil(this.canvas.height / this.blockDims[1])];
        this.resizeOutputTexture();
    }
}