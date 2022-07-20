import { Context } from './context';
import { Camera } from './camera';
import { imagePlane } from './vertices';
import render from '../shaders/render.wgsl';

export class Renderer {
    context: Context;
    camera: Camera;

    slabCentre: number;
    noSamples: number;
    shaderType: any;

    renderUniformBuffer: GPUBuffer;
    computeUniformBuffer: GPUBuffer;
    vertexBuffer: GPUBuffer;
    computeTexture: GPUTexture;
    volumeTexture: GPUTexture;
    sampler: GPUSampler;

    renderBindGroupLayout: GPUBindGroupLayout;
    computeBindGroupLayout: GPUBindGroupLayout;
    renderBindGroup: GPUBindGroup;
    computeBindGroup: GPUBindGroup;
    renderPipeline: GPURenderPipeline;
    computePipeline: GPURenderPipeline;

    commandEncoder: GPUCommandEncoder;
    renderPassDescriptor: GPURenderPassDescriptor;

    constructor(context: Context) {
        this.context = context;
        this.camera = new Camera(this.context.size(), this.context.getVolume());
    }

    public start() {
        console.log('RENDERER: Creating Pipelines...');
        this.initPipelines();
        console.log('RENDERER: Initialising Resources...');
        this.initBuffers();
        this.initResources();
        this.initBindGroups();
        console.log('RENDERER: Rendering...');
    }

    private initPipelines() {
        this.renderBindGroupLayout = this.context.getDevice().createBindGroupLayout({
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
                } as GPUBindGroupLayoutEntry
            ]
        });

        this.computeBindGroupLayout = this.context.getDevice().createBindGroupLayout({
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

        this.renderPipeline = this.context.getDevice().createRenderPipeline({
            layout: this.context.getDevice().createPipelineLayout({
                bindGroupLayouts: [this.renderBindGroupLayout]
            }),
            vertex: {
                module: this.context.getDevice().createShaderModule({ code: render }),
                entryPoint: 'vert_main',
                buffers: [
                        {
                        arrayStride: imagePlane.vertexSize,
                        attributes: [
                            {
                                // Position
                                shaderLocation: 0,
                                offset: imagePlane.positionOffset,
                                format: 'float32x2',
                            }
                        ]
                    } as GPUVertexBufferLayout
                ]
            },
            fragment: {
                module: this.context.getDevice().createShaderModule({ code: render }),
                entryPoint: 'frag_main',
                targets: [{ format: this.context.displayFormat() }]
            }
        });

        this.computePipeline = this.context.getDevice().createRenderPipeline({
            layout: this.context.getDevice().createPipelineLayout({
                bindGroupLayouts: [this.computeBindGroupLayout]
            }),
            vertex: {
                module: this.context.getDevice().createShaderModule({ code: this.shaderType }),
                entryPoint: 'vert_main',
                buffers: [
                        {
                        arrayStride: imagePlane.vertexSize,
                        attributes: [
                            {
                                // Position
                                shaderLocation: 0,
                                offset: imagePlane.positionOffset,
                                format: 'float32x2',
                            }
                        ]
                    } as GPUVertexBufferLayout
                ]
            },
            fragment: {
                module: this.context.getDevice().createShaderModule({ code: this.shaderType }),
                entryPoint: 'frag_main',
                targets: [{ format: 'rgba16float' }]
            }
        });
    }

    private initBuffers() {
        this.renderUniformBuffer = this.context.getDevice().createBuffer({
            size: this.camera.getWWidthLevel().byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        this.computeUniformBuffer = this.context.getDevice().createBuffer({
            size: this.getComputeUniformData().byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        this.vertexBuffer = this.context.getDevice().createBuffer({
            size: imagePlane.vertices.byteLength,
            usage: GPUBufferUsage.VERTEX,
            mappedAtCreation: true
        });
        new Float32Array(this.vertexBuffer.getMappedRange()).set(imagePlane.vertices);
        this.vertexBuffer.unmap();
    }

    private initResources() {
        this.sampler = this.context.getDevice().createSampler({
            magFilter: 'linear',
            minFilter: 'linear'
        });

        this.computeTexture = this.context.getDevice().createTexture({
            size: this.context.size(),
            format: 'rgba16float',
            usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT
        });

        this.volumeTexture = this.context.getDevice().createTexture({
            size: this.context.getVolume().size(),
            // rg8unorm or r8unorm - red(low bits), green(high bits)
            format: this.context.getVolume().textureFormat,
            usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING,
            dimension: '3d'
        });

        const imageDataLayout = {
            offset: 0,
            bytesPerRow: this.context.getVolume().bytesPerLine,
            rowsPerImage: this.context.getVolume().height
        };

        this.context.getQueue().writeTexture({ texture: this.volumeTexture }, this.context.getVolume().data, imageDataLayout, this.context.getVolume().size());

        this.renderPassDescriptor = {
            colorAttachments: [{
                view: undefined, // set in render loop
                clearValue: [0.0, 0.0, 0.0, 1.0],
                loadOp: 'clear' as GPULoadOp,
                storeOp: 'store' as GPUStoreOp
            }]
        };
    }

    private initBindGroups() {
        this.computeBindGroup = this.context.getDevice().createBindGroup({
            layout: this.computeBindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: this.computeUniformBuffer } },
                { binding: 1, resource: this.volumeTexture.createView() },
                { binding: 2, resource: this.sampler }
            ]
        });

        this.renderBindGroup = this.context.getDevice().createBindGroup({
            layout: this.renderBindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: this.renderUniformBuffer } },
                { binding: 1, resource: this.computeTexture.createView() },
            ]
        });
    }

    private executeComputePipeline() {
        this.renderPassDescriptor.colorAttachments[0].view = this.computeTexture.createView();
        const passEncoder = this.commandEncoder.beginRenderPass(this.renderPassDescriptor);
        passEncoder.setPipeline(this.computePipeline);
        this.context.getQueue().writeBuffer(this.computeUniformBuffer, 0, this.getComputeUniformData());
        passEncoder.setBindGroup(0, this.computeBindGroup);
        passEncoder.setVertexBuffer(0, this.vertexBuffer);
        passEncoder.draw(imagePlane.vertexCount);
        passEncoder.end();
    }

    private executeRenderPipeline() {
        this.renderPassDescriptor.colorAttachments[0].view = this.context.getCanvasContext().getCurrentTexture().createView();
        const passEncoder = this.commandEncoder.beginRenderPass(this.renderPassDescriptor);
        passEncoder.setPipeline(this.renderPipeline);
        this.context.getQueue().writeBuffer(this.renderUniformBuffer, 0, this.camera.getWWidthLevel());
        passEncoder.setBindGroup(0, this.renderBindGroup);
        passEncoder.setVertexBuffer(0, this.vertexBuffer);
        passEncoder.draw(imagePlane.vertexCount);
        passEncoder.end();
    }

    private getComputeUniformData() {
        var MPRUniformData = new Float32Array(this.camera.getViewMatrix().length + 2);
        MPRUniformData.set([...this.camera.getViewMatrix(), ...this.camera.getSampleInfo()]);
        return MPRUniformData;
    }

    public render() {
        this.commandEncoder = this.context.getDevice().createCommandEncoder();
        this.executeComputePipeline();
        this.executeRenderPipeline();
        this.context.getQueue().submit([this.commandEncoder.finish()]);
    }

    public resize(width: number, height: number) {
        this.context.resize(width, height);
        this.camera.resize(width, height);
        
        this.computeTexture = this.context.getDevice().createTexture({
            size: this.context.size(),
            format: 'rgba16float',
            usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT
        }); 
        this.initBindGroups();
    }
}