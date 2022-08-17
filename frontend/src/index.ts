import { Context } from './context';
import { RendererManager } from './manager';

async function main(): Promise<void> {

    const context = new Context();
    await context.loadVolume();
    await context.loadTransferFunction();
    const manager = new RendererManager(context);

    await context.initWebGPU();
    console.log('Done');
    
    const run = () => {
        manager.render();
        requestAnimationFrame(run);
    }
    requestAnimationFrame(run);
}

main();
