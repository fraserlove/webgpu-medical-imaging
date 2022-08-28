import { Renderer } from './renderer';
import { SettingsMPR } from './settings';
import mip from '../shaders/mip.wgsl';
import mpr from '../shaders/mpr.wgsl';
import { RendererManager } from './manager';

export class RendererMPR extends Renderer {

    constructor(manager: RendererManager, renderID?: number) {
        super(manager, renderID);
        this.renderShaderType = mpr;
        this.computeShaderType = mip;
        this.settings = new SettingsMPR(this.renderID, manager);
    }

    protected getComputeUniformData(): Float32Array {
        let computeUniformData = new Float32Array(this.camera.getViewMatrix().length + 
                                                    (this.settings as SettingsMPR).getComputeSettings().length + 1);
        computeUniformData.set([...this.camera.getViewMatrix(), 
                                ...(this.settings as SettingsMPR).getComputeSettings(),
                                this.context.getVolume().bitsPerVoxel]);
        return computeUniformData;
    }
}