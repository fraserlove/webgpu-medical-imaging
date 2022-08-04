import { Volume } from './volume';
import { TransferFunction } from './transferFunction';
import { RendererMPR } from './mpr';
import { RendererSVR } from './svr';
import { Context } from './context';

async function main(): Promise<void> {

    const volume = await new Volume();
    const transferFunction = await new TransferFunction();
    const context = new Context(volume, window.innerWidth,  window.innerHeight);
    //const renderers = [new RendererSVR(context, transferFunction)];
    const renderers = [new RendererMPR(context), new RendererSVR(context, transferFunction)];
    // TODO: can only deal with one renderer at a time. Need a way to specify to add a renderer to the context and
    // update the canvas so they display side by side.

    await context.initWebGPU();
    for (let i = 0; i < renderers.length; i++) { await renderers[i].start(); }
    
    const run = () => {
        for (let i = 0; i < renderers.length; i++) { renderers[i].render(); }
        requestAnimationFrame(run);
    }
    requestAnimationFrame(run);
}

main();
