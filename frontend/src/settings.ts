import { GUI } from 'dat.gui';
import { RendererManager } from './manager';

export class GlobalSettings {
    protected gui: GUI;

    constructor(manager: RendererManager) {
        this.gui = new GUI({ autoPlace: false });
        this.gui.domElement.id = 'gui-global';
        document.body.appendChild(this.gui.domElement);

        const folder = this.gui.addFolder('Global Settings');
        folder.add(manager, 'addMPR');
        folder.add(manager, 'addSVR');
    }
}

export class RendererSettings {
    protected gui: GUI;
    protected folder: any;
    protected renderID: number;
    protected manager: RendererManager;

    constructor(renderID: number, manager: RendererManager) {
        this.renderID = renderID;
        this.manager = manager;
        this.gui = new GUI({ autoPlace: false });
        this.gui.domElement.id = 'gui';
        manager.getContext().getContainer(this.renderID).appendChild(this.gui.domElement);

        this.folder = this.gui.addFolder('Render Settings');
        this.folder.open();
    }
}

export class SettingsMPR extends RendererSettings {

    private wWidth: number = 1000.0/65535.0;
    private wLevel: number = 0.498;

    private slabCentre: number;
    private noSamples: number;

    constructor(renderID: number, manager: RendererManager) {
        super(renderID, manager);

        let maxDepth = manager.getContext().getVolume().getDepth();
        this.slabCentre = maxDepth / 2;
        this.noSamples = maxDepth;

        this.folder.add(this, 'noSamples', 0, maxDepth);
        this.folder.add(this, 'slabCentre', 0, maxDepth);
        this.folder.add(this, 'wWidth', 0, 0.05);
        this.folder.add(this, 'wLevel', 0.48, 0.52, 0.0001);
        this.folder.add({destroyRenderer: manager.destroyRenderer.bind(manager, this.renderID)}, 'destroyRenderer');
    }

    public getWWidthLevel(): Float32Array { return new Float32Array([this.wWidth, this.wLevel]); }
    public getSampleInfo(): Float32Array { return new Float32Array([this.slabCentre, this.noSamples]); } 
}

export class SettingsSVR extends RendererSettings {

    constructor(renderID: number, manager: RendererManager) {
        super(renderID, manager);
        this.folder.add({destroyRenderer: manager.destroyRenderer.bind(manager, this.renderID)}, 'destroyRenderer');
    }
}