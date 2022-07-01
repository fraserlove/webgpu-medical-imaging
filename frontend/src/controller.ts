import { Camera } from "./camera";
import { VolumeRenderer } from "./renderer";

export class Controller {
    renderer: VolumeRenderer;
    mouseDown: boolean;
    initPos: [number, number];

    up: boolean;
    down: boolean;
    right: boolean;
    left: boolean;
    forward: boolean;
    back: boolean;

    wWidthInc: boolean;
    wWidthDec: boolean;
    wLevelInc: boolean;
    wLevelDec: boolean;

    scaleFactor: number = 1000;
    rotationFactor: number = 100;
    panFactor: number = 2;
    cineFactor: number = 1;
    wWidthFactor: number = 0.0002;
    wLevelFactor: number = 0.0001;

    constructor(renderer: VolumeRenderer) {
        this.up = this.down = this.right = this.left = this.forward = this.back = false;
        this.mouseDown = false;
        this.renderer = renderer;
        this.initPos = [0, 0];
        this.checkResize();
        this.initMouse();
        this.initKeyboard();
    }

    private initMouse() {
        // Mouse zoom
        document.addEventListener('wheel', (e : WheelEvent) => {
            this.renderer.camera.updateScale(e.deltaY / this.scaleFactor);
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
                    this.renderer.camera.updateRotation(-dx / this.rotationFactor, dy / this.rotationFactor);
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
                case 'q': this.forward = true; break;
                case 'e': this.back = true; break;
                case 'ArrowUp': this.wWidthInc = true; break;
                case 'ArrowLeft': this.wLevelDec = true; break;
                case 'ArrowDown': this.wWidthDec = true; break;
                case 'ArrowRight': this.wLevelInc = true; break;
            }
        }, false);
        document.addEventListener('keyup', (e : KeyboardEvent) => {
            switch(e.key) {
                case 'w': this.up = false; break;
                case 'a': this.left = false; break;
                case 's': this.down = false; break;
                case 'd': this.right = false; break;
                case 'q': this.forward = false; break;
                case 'e': this.back = false; break;
                case 'ArrowUp': this.wWidthInc = false; break;
                case 'ArrowLeft': this.wLevelDec = false; break;
                case 'ArrowDown': this.wWidthDec = false; break;
                case 'ArrowRight': this.wLevelInc = false; break;
            }
        }, false);
    }

    private checkResize() {
        window.onresize = () => {
            // this.renderer.resizeCanvas(window.innerWidth, window.innerHeight);
        }
    }

    public getInput() {
        if (this.up) this.renderer.camera.updatePan(0, -this.panFactor);
        if (this.down) this.renderer.camera.updatePan(0, this.panFactor);
        if (this.left) this.renderer.camera.updatePan(-this.panFactor, 0);
        if (this.right) this.renderer.camera.updatePan(this.panFactor, 0);
        if (this.forward) this.renderer.camera.updateCine(this.cineFactor);
        if (this.back) this.renderer.camera.updateCine(-this.cineFactor);
        if (this.wLevelInc) this.renderer.camera.updateWLevel(this.wLevelFactor);
        if (this.wLevelDec) this.renderer.camera.updateWLevel(-this.wLevelFactor);
        if (this.wWidthInc) this.renderer.camera.updateWWidth(this.wWidthFactor);
        if (this.wWidthDec) this.renderer.camera.updateWWidth(-this.wWidthFactor);
    }
}