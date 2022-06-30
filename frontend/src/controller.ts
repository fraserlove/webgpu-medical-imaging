import { VolumeRenderer } from "./renderer";

export class Controller {
    renderer: VolumeRenderer;
    mouseDown: boolean;
    initPos: [number, number];

    constructor(renderer: VolumeRenderer) {
        this.renderer = renderer;
        this.mouseDown = false;
        this.initPos = [0, 0];
        this.initMouse();
    }

    initMouse() {
        this.renderer.canvas.onmousedown = (e: MouseEvent) => {
            this.mouseDown = true;
            this.initPos = [e.pageX, e.pageY]
        }
        this.renderer.canvas.onmouseup = (e: MouseEvent) => {
            this.mouseDown = false;
        }
        this.renderer.canvas.onmousemove = (e: MouseEvent) => {
            if (this.mouseDown) {
                if (this.initPos[0] > 0 && this.initPos[1] > 0) {
                    const dx = e.pageX - this.initPos[0];
                    const dy = e.pageY - this.initPos[1];
                    this.renderer.camera.rotateView(-dx / 100, dy / 100);
                }
                this.initPos = [e.pageX, e.pageY];
            }
        }
    }
}