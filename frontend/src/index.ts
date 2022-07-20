import { Volume } from './volume';
import { RendererMPR } from './mpr';
import { Controller } from './controller';
import { Context } from './context';

var width = window.innerWidth;
var height = window.innerHeight;

async function main() {

    const volume = await new Volume();
    const context = new Context(volume, width, height);
    const renderer = new RendererMPR(context);
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
