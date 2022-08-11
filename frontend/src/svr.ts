import { Renderer } from './renderer';
import { SettingsSVR } from './settings';
import ea16 from '../shaders/ea16.wgsl';
import ea8 from '../shaders/ea8.wgsl';
import svr from '../shaders/svr.wgsl';
import { RendererManager } from './manager';

export class RendererSVR extends Renderer {

    private transferFunctionTexture: GPUTexture;

    constructor(manager: RendererManager) {
        super(manager);
        this.renderShaderType = svr;
        this.settings = new SettingsSVR(this.renderID, manager);
        if (this.context.getVolume().getBitsPerVoxel() == 8) this.computeShaderType = ea8;
        else if (this.context.getVolume().getBitsPerVoxel() == 16) this.computeShaderType = ea16;
    }

    public start(): void {
        this.context.getTransferFunction().setWidth(this.context.getDevice().limits.maxTextureDimension1D);
        super.start();
    }

    protected initPipelineLayouts(): void {
        super.initPipelineLayouts();
        
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
                } as GPUBindGroupLayoutEntry,
                {
                    binding: 3,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: { sampleType: 'unfilterable-float', viewDimension: '2d' }
                } as GPUBindGroupLayoutEntry
            ]
        });
    }

    protected initResources(): void {
        super.initResources();

        this.transferFunctionTexture = this.context.getDevice().createTexture({
            size: this.context.getTransferFunction().size(),
            format: this.context.getTransferFunction().getColourFormat(),
            usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING,
            dimension: '2d'
        });

        const imageDataLayout = {
            offset: 0,
            bytesPerRow: this.context.getTransferFunction().getBytesPerRow(),
            rowsPerImage: this.context.getTransferFunction().getRowsPerImage()
        };

        this.context.getQueue().writeTexture({ texture: this.transferFunctionTexture }, this.context.getTransferFunction().getData(), imageDataLayout, this.context.getTransferFunction().size());
    }

    protected initBindGroups(): void {
        super.initBindGroups();

        this.computeBindGroup = this.context.getDevice().createBindGroup({
            layout: this.computeBindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: this.computeUniformBuffer } },
                { binding: 1, resource: this.volumeTexture.createView() },
                { binding: 2, resource: this.sampler },
                { binding: 3, resource: this.transferFunctionTexture.createView() }
            ]
        });
    }

    protected getComputeUniformData(): Float32Array {
        let computeUniformData = new Float32Array(this.camera.getViewMatrix().length + this.camera.getLightDir().length + this.context.getVolume().getBoundingBox().length + 1);
        computeUniformData.set([...this.camera.getViewMatrix(), ...this.camera.getLightDir(), ...this.context.getVolume().getBoundingBox(), this.context.getTransferFunction().getWidth()]);
        return computeUniformData;
    }
}