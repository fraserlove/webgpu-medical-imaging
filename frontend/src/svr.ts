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

    protected initComputeGroup(): void {
        this.computeBindGroupEntries.push({ binding: 3, resource: this.transferFunctionTexture.createView() });
        super.initComputeGroup()
    }

    protected getComputeUniformData(): Float32Array {
        let paddingLength = 3; // length of padding (bytelength of padding is this value * 4)
        let computeUniformData = new Float32Array(this.camera.getViewMatrix().length + 
                                                    this.camera.getLightDir().length + 
                                                    this.camera.getViewDir().length + 
                                                    this.context.getVolume().getBoundingBox().length + 
                                                    (this.settings as SettingsSVR).getComputeSettings().length + 
                                                    1 + paddingLength);
                                                    
        // extra zeros are required padding, see - https://www.w3.org/TR/WGSL/#alignment-and-size
        computeUniformData.set([...this.camera.getViewMatrix(), 
                                ...this.camera.getLightDir(), 0, 
                                ...this.camera.getViewDir(), 0, 
                                ...this.context.getVolume().getBoundingBox(), 0, 
                                ...(this.settings as SettingsSVR).getComputeSettings(), 
                                this.context.getTransferFunction().getWidth()]);
        return computeUniformData;
    }
}