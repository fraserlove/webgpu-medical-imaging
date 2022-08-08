import { Renderer } from './renderer';
import { SettingsMPR } from './settings';
import mip16 from '../shaders/mip16.wgsl';
import mip8 from '../shaders/mip8.wgsl';
import mpr from '../shaders/mpr.wgsl';
import { RendererManager } from './manager';

export class RendererMPR extends Renderer {

    private settings: SettingsMPR;

    constructor(manager: RendererManager) {
        super(manager);
        this.renderShaderType = mpr;
        this.settings = new SettingsMPR(manager);
        if (this.context.getVolume().getBitsPerVoxel() == 8) this.computeShaderType = mip8;
        else if (this.context.getVolume().getBitsPerVoxel() == 16) this.computeShaderType = mip16;
    }

    protected getRenderUniformData(): Float32Array {
        return this.settings.getWWidthLevel();
    }

    protected getComputeUniformData(): Float32Array {
        let computeUniformData = new Float32Array(this.camera.getViewMatrix().length + 2);
        computeUniformData.set([...this.camera.getViewMatrix(), ...this.settings.getSampleInfo()]);
        return computeUniformData;
    }

    protected initBindGroups(): void {
        super.initBindGroups();
        
        this.computeBindGroup = this.context.getDevice().createBindGroup({
            layout: this.computeBindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: this.computeUniformBuffer } },
                { binding: 1, resource: this.volumeTexture.createView() },
                { binding: 2, resource: this.sampler }
            ]
        });
    }
}