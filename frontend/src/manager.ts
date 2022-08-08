import { Context } from "./context";
import { RendererMPR } from "./mpr";
import { Renderer } from "./renderer";
import { RendererSVR } from "./svr";
import { GlobalSettings } from "./settings";

export class RendererManager {

    private renderers: Renderer[];
    private context: Context;
    private settings: GlobalSettings;

    constructor(context) {
        this.context = context;
        this.renderers = [];
        this.settings = new GlobalSettings(this);

        window.onresize = () => {
            if (this.context.getDevice() != undefined) { this.resize(window.innerWidth, window.innerHeight); }
        }
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

    private async addRenderer(renderer: Renderer) {
        this.renderers.push(renderer);
        this.resize(window.innerWidth, window.innerHeight);
        await renderer.start();
    }

    public resize(width: number, height: number) {
        for (let i = 0; i < this.renderers.length; i++) {
            this.renderers[i].resize([width / this.renderers.length, height]);
        }
    }
}