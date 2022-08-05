import { Context } from "./context";
import { RendererMPR } from "./mpr";
import { Renderer } from "./renderer";
import { RendererSVR } from "./svr";

export class RendererManager {
    private renderers: Renderer[];
    private context: Context;

    constructor(context) {
        this.context = context;
        this.renderers = [];

        window.onresize = () => {
            if (this.context.getDevice() != undefined) { this.resize(window.innerWidth, window.innerHeight); }
        }
    }

    public async start() {
        for (let i = 0; i < this.renderers.length; i++) { await this.renderers[i].start(); }
    }

    public render() {
        for (let i = 0; i < this.renderers.length; i++) { this.renderers[i].render(); }
    }

    public addMPR() {
        let renderer = new RendererMPR(this.renderers.length, this.context);
        this.addRenderer(renderer);
    }

    public addSVR() {
        let renderer = new RendererSVR(this.renderers.length, this.context);
        this.addRenderer(renderer);
    }

    private addRenderer(renderer: Renderer) {
        this.renderers.push(renderer);
        this.resize(window.innerWidth, window.innerHeight);
    }

    public resize(width: number, height: number) {
        for (let i = 0; i < this.renderers.length; i++) {
            this.renderers[i].resize([width / this.renderers.length, height]);
        }
    }
}