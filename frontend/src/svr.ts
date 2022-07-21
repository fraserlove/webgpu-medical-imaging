import { Renderer } from './renderer';
import { TransferFunction } from './transferFunction';
import { Context } from './context';
import ea16 from '../shaders/ea16.wgsl';
import ea8 from '../shaders/ea8.wgsl';
import svr from '../shaders/svr.wgsl';

export class RendererSVR extends Renderer {

    private transferFunction: TransferFunction;

    constructor(context: Context, transferFunction: TransferFunction) {
        super(context);
        this.transferFunction = transferFunction;
        this.renderShaderType = svr;
        if (this.context.getVolume().getBitsPerVoxel() == 8) this.computeShaderType = ea8;
        else if (this.context.getVolume().getBitsPerVoxel() == 16) this.computeShaderType = ea16;
    }
}