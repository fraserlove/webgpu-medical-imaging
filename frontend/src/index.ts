import { Volume } from './volume';
import { VolumeRenderer } from './renderer';
import { Controller } from './controller';

var settings = {
    wWidth: 1000.0/65535.0,
    wLevel: 0.498
};

async function main() {

    const volume = await new Volume();
    const volumeRenderer = new VolumeRenderer(volume, settings);
    const controller = new Controller(volumeRenderer);

    await volumeRenderer.start();
    
    const run = () => {
        volumeRenderer.render();
        controller.getInput();
        requestAnimationFrame(run);
    }
    requestAnimationFrame(run);
}

main()
