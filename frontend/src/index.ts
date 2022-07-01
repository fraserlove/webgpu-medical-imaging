import { Volume } from './volume';
import { VolumeRenderer } from './renderer';
import { Controller } from './controller';

async function main() {

    const volume = await new Volume();
    const volumeRenderer = new VolumeRenderer(volume);
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
