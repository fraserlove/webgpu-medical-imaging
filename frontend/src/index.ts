import { Volume } from './volume';
import { VolumeRenderer } from './renderer';

const windowWidth = 512;
const windowHeight = 512;

var settings = {
    wWidth: 1000.0/65535.0,
    wLevel: 0.498
}

async function main() {

    const volume = await new Volume();

    const canvas = document.createElement('canvas');
    canvas.width = windowWidth;
    canvas.height = windowHeight;
    document.body.appendChild(canvas);

    const volumeRenderer = new VolumeRenderer(volume, canvas, settings);
    await volumeRenderer.start();
    
    const run = () => {
        volumeRenderer.render();
        requestAnimationFrame(run);
    }
    requestAnimationFrame(run);
}

main()
