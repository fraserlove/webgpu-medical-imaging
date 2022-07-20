import { Renderer } from './renderer';
import { Context } from './context';
import mip16 from '../shaders/mip16.wgsl';
import mip8 from '../shaders/mip8.wgsl';

export class RendererMPR extends Renderer {

    constructor(context: Context) {
        super(context);
        if (this.context.getVolume().bitsPerVoxel == 8) this.shaderType = mip8
        else if (this.context.getVolume().bitsPerVoxel == 16) this.shaderType = mip16
    }
}