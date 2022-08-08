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
            if (this.context.getDevice() != undefined) { this.resize(); }
        }
    }

    public getContext(): Context { return this.context; }
    public highestIndex(): number { return this.renderers.length; }

    public render(): void {
        for (let i = 0; i < this.renderers.length; i++) { this.renderers[i].render(); }
    }

    public addMPR(): void {
        let renderer = new RendererMPR(this);
        this.addRenderer(renderer);
    }

    public addSVR(): void {
        let renderer = new RendererSVR(this);
        this.addRenderer(renderer);
    }

    private async addRenderer(renderer: Renderer): Promise<void> {
        this.renderers.push(renderer);
        this.resize();
        await renderer.start();
    }

    public destroyRenderer(rendererID: number): void {
        this.context.removeWindow(rendererID);
        this.renderers.splice(rendererID);
        this.resize();
    }

    public resize(): void {
        for (let i = 0; i < this.renderers.length; i++) {
            this.renderers[i].resize([window.innerWidth / this.renderers.length, window.innerHeight]);
        }
    }
}