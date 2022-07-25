import { Renderer } from './renderer';
import { Context } from './context';
import mip16 from '../shaders/mip16.wgsl';
import mip8 from '../shaders/mip8.wgsl';
import mpr from '../shaders/mpr.wgsl';

export class RendererMPR extends Renderer {

    constructor(context: Context) {
        super(context);
        this.renderShaderType = mpr;
        if (this.context.getVolume().getBitsPerVoxel() == 8) this.computeShaderType = mip8;
        else if (this.context.getVolume().getBitsPerVoxel() == 16) this.computeShaderType = mip16;
    }

    protected getRenderUniformData(): Float32Array {
        return this.camera.getWWidthLevel();
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