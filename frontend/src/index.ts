import { Volume } from './volume';
import { VolumeRenderer } from './renderer';
import { Controller } from './controller';

var width = window.innerWidth;
var height = window.innerHeight;

async function main() {

    const volume = await new Volume();
    const volumeRenderer = new VolumeRenderer(volume, width, height);
    const controller = new Controller(volumeRenderer);

    await volumeRenderer.start();
    
    const run = () => {
        volumeRenderer.render();
        controller.updateInputs();
        requestAnimationFrame(run);
    }
    requestAnimationFrame(run);
}

main();
