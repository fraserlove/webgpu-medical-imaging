import { Renderer } from './renderer';
import { SettingsSVR } from './settings';
import ea16 from '../shaders/ea16.wgsl';
import ea8 from '../shaders/ea8.wgsl';
import svr from '../shaders/svr.wgsl';
import { RendererManager } from './manager';

export class RendererSVR extends Renderer {

    private transferFunctionTexture: GPUTexture;

    constructor(manager: RendererManager, renderID?: number) {
        super(manager, renderID);
        this.renderShaderType = svr;
        this.settings = new SettingsSVR(this.renderID, manager);
        if (this.context.getVolume().bitsPerVoxel == 8) this.computeShaderType = ea8;
        else if (this.context.getVolume().bitsPerVoxel == 16) this.computeShaderType = ea16;
    }

    protected initPipelineLayouts(): void {
        this.computeBindGroupLayoutEntries.push({
            binding: 3,
            visibility: GPUShaderStage.FRAGMENT,
            texture: { sampleType: 'unfilterable-float', viewDimension: '2d' }
        });
        super.initPipelineLayouts();
    }

    protected initResources(): void {
        super.initResources();

        this.transferFunctionTexture = this.context.getDevice().createTexture({
            size: this.context.getTransferFunction().size,
            format: this.context.getTransferFunction().colourFormat,
            usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING,
            dimension: '2d'
        });

        const imageDataLayout = {
            offset: 0,
            bytesPerRow: this.context.getTransferFunction().size[0] * 4 * 4,
            rowsPerImage: this.context.getTransferFunction().size[1]
        };

        this.context.getQueue().writeTexture({ texture: this.transferFunctionTexture }, this.context.getTransferFunction().data, imageDataLayout, this.context.getTransferFunction().size);
    }

    protected initComputeGroup(): void {
        this.computeBindGroupEntries = [];
        this.computeBindGroupEntries.push({ binding: 0, resource: { buffer: this.computeUniformBuffer } });
        this.computeBindGroupEntries.push({ binding: 1, resource: this.volumeTexture.createView() });
        this.computeBindGroupEntries.push({ binding: 2, resource: this.sampler });
        this.computeBindGroupEntries.push({ binding: 3, resource: this.transferFunctionTexture.createView() });

        this.computeBindGroup = this.context.getDevice().createBindGroup({
            layout: this.computeBindGroupLayout,
            entries: this.computeBindGroupEntries
        });
    }

    protected getComputeUniformData(): Float32Array {
        let paddingLength = 2; // length of padding (bytelength of padding is this value * 4)
        let computeUniformData = new Float32Array(this.camera.getViewMatrix().length + 
                                                    this.camera.getLightDir().length + 
                                                    this.context.getVolume().boundingBox.length + 
                                                    (this.settings as SettingsSVR).getComputeSettings().length + 
                                                    1 + paddingLength);
                                                    
        // extra zeros are required padding, see - https://www.w3.org/TR/WGSL/#alignment-and-size
        computeUniformData.set([...this.camera.getViewMatrix(), 
                                ...this.camera.getLightDir(), 0,
                                ...this.context.getVolume().boundingBox, 0, 
                                ...(this.settings as SettingsSVR).getComputeSettings(), 
                                this.context.getTransferFunction().size[0]]);
        return computeUniformData;
    }
}