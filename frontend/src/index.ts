import { Volume } from './volume';
import { TransferFunction } from './transferFunction';
import { RendererMPR } from './mpr';
import { RendererSVR } from './svr';
import { Controller } from './controller';
import { Context } from './context';

async function main(): Promise<void> {

    const volume = await new Volume();
    const transferFunction = await new TransferFunction();
    const context = new Context(volume, window.innerWidth,  window.innerHeight);
    const renderer = new RendererSVR(context, transferFunction);
    const controller = new Controller(renderer);

    await context.initWebGPU();
    await renderer.start();
    
    const run = () => {
        renderer.render();
        controller.updateInputs();
        requestAnimationFrame(run);
    }
    requestAnimationFrame(run);
}

main();
