import { Context } from "./context";
import { RendererMPR } from "./mpr";
import { Renderer } from "./renderer";
import { RendererSVR } from "./svr";
import { GlobalSettings } from "./settings";

export class RendererManager {

    private renderers: Map<number, Renderer>;
    private context: Context;
    private settings: GlobalSettings;

    constructor(context) {
        this.context = context;
        this.renderers = new Map<number, Renderer>();
        this.settings = new GlobalSettings(this);

        window.onresize = () => {
            if (this.context.getDevice() != undefined) { this.resize(); }
        }
    }

    public getContext(): Context { return this.context; }

    public render(): void {
        for (const [key, renderer] of this.renderers.entries()) { renderer.render(); }
    }

    public addMPR(): void { this.addRenderer(new RendererMPR(this)); }

    public addSVR(): void { this.addRenderer(new RendererSVR(this)); }

    private async addRenderer(renderer: Renderer): Promise<void> {
        this.renderers.set(renderer.getID(), renderer);
        this.resize();
        await renderer.start();
    }

    public destroyRenderer(rendererID: number): void {
        this.context.removeWindow(rendererID);
        this.renderers.delete(rendererID);
        this.resize();
    }

    public resize(): void {
        for (const [key, renderer] of this.renderers.entries()) {
            renderer.resize([window.innerWidth / this.renderers.size, window.innerHeight]);
        }
    }
}