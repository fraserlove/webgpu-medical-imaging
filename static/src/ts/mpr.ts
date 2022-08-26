import { Renderer } from './renderer';
import { SettingsMPR } from './settings';
import mip16 from '../shaders/mip16.wgsl';
import mip8 from '../shaders/mip8.wgsl';
import mpr from '../shaders/mpr.wgsl';
import { RendererManager } from './manager';

export class RendererMPR extends Renderer {

    constructor(manager: RendererManager, renderID?: number) {
        super(manager, renderID);
        this.renderShaderType = mpr;
        this.settings = new SettingsMPR(this.renderID, manager);
        if (this.context.getVolume().bitsPerVoxel == 8) this.computeShaderType = mip8;
        else if (this.context.getVolume().bitsPerVoxel == 16) this.computeShaderType = mip16;
    }

    protected getComputeUniformData(): Float32Array {
        let computeUniformData = new Float32Array(this.camera.getViewMatrix().length + 
                                                    (this.settings as SettingsMPR).getComputeSettings().length);
        computeUniformData.set([...this.camera.getViewMatrix(), 
                                ...(this.settings as SettingsMPR).getComputeSettings()]);
        return computeUniformData;
    }
}