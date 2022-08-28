import { Renderer } from './renderer';
import { SettingsMPR } from './settings';
import mpr from '../shaders/mpr.wgsl';
import { RendererManager } from './manager';

export class RendererMPR extends Renderer {

    constructor(manager: RendererManager, renderID?: number) {
        super(manager, renderID);
        this.shaderType = mpr;
        this.settings = new SettingsMPR(this.renderID, manager);
    }

    protected getUniformData(): Float32Array {
        let uniformData = new Float32Array(this.camera.getViewMatrix().length + 
                                                    (this.settings as SettingsMPR).getSettings().length + 1);
        uniformData.set([...this.camera.getViewMatrix(), 
                                ...(this.settings as SettingsMPR).getSettings(),
                                this.context.getVolume().bitsPerVoxel]);
        return uniformData;
    }
}