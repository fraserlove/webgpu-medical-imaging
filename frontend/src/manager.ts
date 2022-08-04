import { Renderer } from "./renderer";

export class RendererManager {
    private renderers: Renderer[];

    private width: number;
    private height: number;

    constructor(renderers: Renderer[]) {
        this.renderers = renderers;

        window.onresize = () => {
            if (this.renderers[0].context.getDevice() != undefined) { this.resize(window.innerWidth, window.innerHeight); }
        }
        this.resize(window.innerWidth, window.innerHeight);
    }

    public async start() {
        for (let i = 0; i < this.renderers.length; i++) { await this.renderers[i].start(); }
    }

    public render() {
        for (let i = 0; i < this.renderers.length; i++) { this.renderers[i].render(); }
    }

    public addRenderer(renderer: Renderer) {
        this.renderers.push(renderer);
        this.resize(window.innerWidth, window.innerHeight);
    }

    public resize(width: number, height: number) {
        this.width = width;
        this.height = height;
        for (let i = 0; i < this.renderers.length; i++) {
            console.log(i + ' ' + this.width / this.renderers.length + ' ' + this.height);
            this.renderers[i].resize([this.width / this.renderers.length, this.height]);
        }
    }
}