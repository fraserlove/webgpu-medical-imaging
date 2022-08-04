import { Renderer } from "./renderer";

export class Controller {
    private renderer: Renderer;
    private canvas: HTMLCanvasElement;
    private leftDown: boolean;
    private updateLightSource: boolean;
    private rightDown: boolean;
    private initPos: [number, number];

    private wWidthInc: boolean;
    private wWidthDec: boolean;
    private wLevelInc: boolean;
    private wLevelDec: boolean;
    private noSamplesInc: boolean;
    private noSamplesDec: boolean;

    private scaleFactor: number = 1000;
    private rotationFactor: number = 100;
    private cineFactor: number = 10;
    private wWidthFactor: number = 0.0002;
    private wLevelFactor: number = 0.0001;
    private noSamplesFactor: number = 5;
    private lightFactor: number = 400;

    constructor(renderer: Renderer) {
        this.renderer = renderer;
        this.canvas = this.renderer.context.getWindow(this.renderer.renderID);
        this.leftDown = false;
        this.updateLightSource = false;
        this.initPos = [0, 0];
        this.checkResize();
        this.initMouse();
        this.initKeyboard();
    }

    private initMouse(): void {
        // Mouse zoom
        this.canvas.addEventListener('wheel', (e: WheelEvent) => {
            e.preventDefault(); // Disables backwards page-navigation on horizontal scroll
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) this.renderer.camera.updateScale(e.deltaY / this.scaleFactor);
            else if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) this.renderer.camera.updateCine(e.deltaX / this.cineFactor);
        }, { passive: false });

        // Mouse drag
        this.canvas.addEventListener('mousedown', (e: MouseEvent) => {
            if (e.button == 0) this.leftDown = true;
            else if (e.button == 2) this.rightDown = true;
            this.initPos = [e.pageX, e.pageY];
        }, false);
        this.canvas.addEventListener('mouseup', (e: MouseEvent) => {
            if (e.button == 0) this.leftDown = false; 
            else if (e.button == 2) this.rightDown = false;
        }, false);
        this.canvas.addEventListener('mousemove', (e: MouseEvent) => {
            const dx = e.pageX - this.initPos[0];
            const dy = e.pageY - this.initPos[1];
            if (this.updateLightSource && this.leftDown) this.renderer.camera.updateLighting(dx / this.lightFactor, dy / this.lightFactor);
            else if (!this.updateLightSource && this.leftDown) this.renderer.camera.updateRotation(-dx / this.rotationFactor, dy / this.rotationFactor);
            else if (this.rightDown) this.renderer.camera.updatePan(dx, dy);
            this.initPos = [e.pageX, e.pageY];
        }, false);

        // Disable right-click menu
        this.canvas.oncontextmenu = function (e) {
            e.preventDefault();
        };
    }

    private initKeyboard(): void {
        // Arrow controls
        document.addEventListener('keydown', (e : KeyboardEvent) => {
            switch(e.key) {
                case 'ArrowUp': this.wWidthInc = true; break;
                case 'ArrowLeft': this.wLevelDec = true; break;
                case 'ArrowDown': this.wWidthDec = true; break;
                case 'ArrowRight': this.wLevelInc = true; break;
                case '=': this.noSamplesInc = true; break;
                case '-': this.noSamplesDec = true; break;
                case 'Shift': this.updateLightSource = true; break;
            }
        }, false);
        document.addEventListener('keyup', (e : KeyboardEvent) => {
            switch(e.key) {
                case 'ArrowUp': this.wWidthInc = false; break;
                case 'ArrowLeft': this.wLevelDec = false; break;
                case 'ArrowDown': this.wWidthDec = false; break;
                case 'ArrowRight': this.wLevelInc = false; break;
                case '+': case '=': this.noSamplesInc = false; break;
                case '-': case '_': this.noSamplesDec = false; break;
                case 'Shift': this.updateLightSource = false; break;
            }
        }, false);
    }

    private checkResize(): void {
        window.onresize = () => {
            if (this.renderer.context.getDevice() != undefined) {
                this.renderer.context.resize(window.innerWidth, window.innerHeight);
                this.renderer.resize();
            }
        }
    }

    public updateInputs(): void {
        if (this.wLevelInc) this.renderer.camera.updateWLevel(this.wLevelFactor);
        if (this.wLevelDec) this.renderer.camera.updateWLevel(-this.wLevelFactor);
        if (this.wWidthInc) this.renderer.camera.updateWWidth(this.wWidthFactor);
        if (this.wWidthDec) this.renderer.camera.updateWWidth(-this.wWidthFactor);
        if (this.noSamplesInc) this.renderer.camera.updateNoSamples(this.noSamplesFactor);
        if (this.noSamplesDec) this.renderer.camera.updateNoSamples(-this.noSamplesFactor);
    }
}