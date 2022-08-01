import { Renderer } from './renderer';
import { TransferFunction } from './transferFunction';
import { Context } from './context';
import ea16 from '../shaders/ea16.wgsl';
import ea8 from '../shaders/ea8.wgsl';
import svr from '../shaders/svr.wgsl';

export class RendererSVR extends Renderer {

    private transferFunction: TransferFunction;

    private transferFunctionTexture: GPUTexture;

    constructor(context: Context, transferFunction: TransferFunction) {
        super(context);
        this.transferFunction = transferFunction;
        this.renderShaderType = svr;
        if (this.context.getVolume().getBitsPerVoxel() == 8) this.computeShaderType = ea8;
        else if (this.context.getVolume().getBitsPerVoxel() == 16) this.computeShaderType = ea16;
    }

    public start(): void {
        this.transferFunction.setWidth(this.context.getDevice().limits.maxTextureDimension1D);
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
            size: this.transferFunction.size(),
            format: this.transferFunction.getColourFormat(),
            usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING,
            dimension: '2d'
        });

        const imageDataLayout = {
            offset: 0,
            bytesPerRow: this.transferFunction.getBytesPerRow(),
            rowsPerImage: this.transferFunction.getRowsPerImage()
        };

        this.context.getQueue().writeTexture({ texture: this.transferFunctionTexture }, this.transferFunction.getData(), imageDataLayout, this.transferFunction.size());
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
        computeUniformData.set([...this.camera.getViewMatrix(), ...this.camera.getLightDir(), ...this.context.getVolume().getBoundingBox(), this.transferFunction.getWidth()]);
        return computeUniformData;
    }
}