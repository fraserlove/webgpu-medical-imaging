import { Volume } from './volume';
import { TransferFunction } from './transferFunction';
import { RendererMPR } from './mpr';
import { RendererSVR } from './svr';
import { Context } from './context';
import { RendererManager } from './manager';

async function main(): Promise<void> {

    const volume = await new Volume();
    const transferFunction = await new TransferFunction();
    const context1 = new Context(volume, transferFunction);
    const context2 = new Context(volume, transferFunction);
    const renderers = [new RendererMPR(context1), new RendererSVR(context2)];
    const manager = new RendererManager(renderers);

    await context1.initWebGPU();
    await context2.initWebGPU();

    await manager.start();
    
    const run = () => {
        manager.render();
        requestAnimationFrame(run);
    }
    requestAnimationFrame(run);
}

main();
