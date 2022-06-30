import { VolumeRenderer } from "./renderer";

export class Controller {
    renderer: VolumeRenderer;
    mouseDown: boolean;
    initPos: [number, number];
    up: boolean;
    down: boolean;
    right: boolean;
    left: boolean;

    zoomFactor: number = 400;
    dragFactor: number = 100;
    panFactor: number = 1;

    constructor(renderer: VolumeRenderer) {
        this.up = this.down = this.right = this.left = false;
        this.mouseDown = false;
        this.renderer = renderer;
        this.initPos = [0, 0];
        this.initMouse();
        this.initKeyboard();
    }

    private initMouse() {
        // Mouse zoom
        document.addEventListener('wheel', (e : WheelEvent) => {
            this.renderer.camera.scaleView(e.deltaY / this.zoomFactor);
        }, false);

        // Mouse drag
        document.addEventListener('mousedown', (e: MouseEvent) => {
            this.mouseDown = true;
            this.initPos = [e.pageX, e.pageY]
        }, false);
        document.addEventListener('mouseup', (e: MouseEvent) => {
            this.mouseDown = false;
        }, false);
        document.addEventListener('mousemove', (e: MouseEvent) => {
            if (this.mouseDown) {
                if (this.initPos[0] > 0 && this.initPos[1] > 0) {
                    const dx = e.pageX - this.initPos[0];
                    const dy = e.pageY - this.initPos[1];
                    this.renderer.camera.rotateView(-dx / this.dragFactor, dy / this.dragFactor);
                }
                this.initPos = [e.pageX, e.pageY];
            }
        }, false);
    }

    private initKeyboard() {
        // WASD controls
        document.addEventListener('keydown', (e : KeyboardEvent) => {
            switch(e.key) {
                case 'w': this.up = true; break;
                case 'a': this.left = true; break;
                case 's': this.down = true; break;
                case 'd': this.right = true; break;
            }
        }, false);
        document.addEventListener('keyup', (e : KeyboardEvent) => {
            switch(e.key) {
                case 'w': this.up = false; break;
                case 'a': this.left = false; break;
                case 's': this.down = false; break;
                case 'd': this.right = false; break;
            }
        }, false);
    }

    public getInput() {
        if (this.up) this.renderer.camera.panView(0, -this.panFactor);
        if (this.down) this.renderer.camera.panView(0, this.panFactor);
        if (this.left) this.renderer.camera.panView(-this.panFactor, 0);
        if (this.right) this.renderer.camera.panView(this.panFactor, 0);
    }
}