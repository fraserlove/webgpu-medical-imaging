import { VolumeRenderer } from "./renderer";

export class Controller {
    renderer: VolumeRenderer;
    leftDown: boolean;
    rightDown: boolean;
    initPos: [number, number];

    wWidthInc: boolean;
    wWidthDec: boolean;
    wLevelInc: boolean;
    wLevelDec: boolean;

    minDelta: number = 2;
    scaleFactor: number = 1000;
    rotationFactor: number = 100;
    cineFactor: number = 10;
    wWidthFactor: number = 0.0002;
    wLevelFactor: number = 0.0001;

    constructor(renderer: VolumeRenderer) {
        this.leftDown = false;
        this.renderer = renderer;
        this.initPos = [0, 0];
        this.checkResize();
        this.initMouse();
        this.initKeyboard();
    }

    private initMouse() {
        // Mouse zoom
        document.addEventListener('wheel', (e: WheelEvent) => {
            e.preventDefault(); // Disables backwards page-navigation on horizontal scroll
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) this.renderer.camera.updateScale(e.deltaY / this.scaleFactor);
            else if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) this.renderer.camera.updateCine(e.deltaX / this.cineFactor);
        }, { passive: false });

        // Mouse drag
        document.addEventListener('mousedown', (e: MouseEvent) => {
            if (e.button == 0) this.leftDown = true; 
            else if (e.button == 2) this.rightDown = true;
            this.initPos = [e.pageX, e.pageY];
        }, false);
        document.addEventListener('mouseup', (e: MouseEvent) => {
            if (e.button == 0) this.leftDown = false; 
            else if (e.button == 2) this.rightDown = false;
        }, false);
        document.addEventListener('mousemove', (e: MouseEvent) => {
            const dx = e.pageX - this.initPos[0];
            const dy = e.pageY - this.initPos[1];
            if (this.leftDown) this.renderer.camera.updateRotation(-dx / this.rotationFactor, dy / this.rotationFactor);
            else if (this.rightDown) this.renderer.camera.updatePan(dx, dy);
            this.initPos = [e.pageX, e.pageY];
        }, false);

        // Disable right-click menu
        this.renderer.canvas.oncontextmenu = function (e) {
            e.preventDefault();
        };
    }

    private initKeyboard() {
        // Arrow controls
        document.addEventListener('keydown', (e : KeyboardEvent) => {
            switch(e.key) {
                case 'ArrowUp': this.wWidthInc = true; break;
                case 'ArrowLeft': this.wLevelDec = true; break;
                case 'ArrowDown': this.wWidthDec = true; break;
                case 'ArrowRight': this.wLevelInc = true; break;
            }
        }, false);
        document.addEventListener('keyup', (e : KeyboardEvent) => {
            switch(e.key) {
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

    public updateInputs() {
        if (this.wLevelInc) this.renderer.camera.updateWLevel(this.wLevelFactor);
        if (this.wLevelDec) this.renderer.camera.updateWLevel(-this.wLevelFactor);
        if (this.wWidthInc) this.renderer.camera.updateWWidth(this.wWidthFactor);
        if (this.wWidthDec) this.renderer.camera.updateWWidth(-this.wWidthFactor);
    }
}