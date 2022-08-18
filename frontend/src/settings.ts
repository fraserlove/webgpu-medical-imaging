import { GUI } from 'lil-gui';
import { RendererManager } from './manager';

export class GlobalSettings {
    protected gui: GUI;

    constructor(manager: RendererManager) {
        this.gui = new GUI({ title: 'Add Renderer', width: 120, autoPlace: false });
        this.gui.domElement.id = 'gui-global';
        document.body.appendChild(this.gui.domElement);

        this.gui.add(manager, 'addMPR');
        this.gui.add(manager, 'addSVR');
    }
}

export class RendererSettings {
    protected gui: GUI;
    protected renderID: number;
    protected manager: RendererManager;

    constructor(renderID: number, manager: RendererManager) {
        this.renderID = renderID;
        this.manager = manager;
        this.gui = new GUI({ title: 'Renderer', width: 250, autoPlace: false });
        this.gui.domElement.id = 'gui';

        let volumeController = this.gui.add(manager.getContext().getVolume(), 'filename', manager.getContext().getVolumeIDs())
        volumeController.name('Volume');

        volumeController.onChange(async volumeID => {
            await manager.getContext().loadVolume(volumeID);
            manager.reloadRenderer(this.renderID);
        });

        manager.getContext().getContainer(this.renderID).appendChild(this.gui.domElement);
    }

    public getRenderSettings(): Float32Array { return new Float32Array(1); }
    public getComputeSettings(): Float32Array { return new Float32Array(1); }
}

export class SettingsMPR extends RendererSettings {

    private wWidth: number = 1000.0/65535.0;
    private wLevel: number = 0.498;

    private slabCentre: number;
    private noSamples: number;

    constructor(renderID: number, manager: RendererManager) {
        super(renderID, manager);
        this.gui.title('MPR Settings');

        let maxDepth = manager.getContext().getVolume().size[2];
        this.slabCentre = Math.round(maxDepth / 2);
        this.noSamples = maxDepth;

        this.gui.add(this, 'noSamples', 0, maxDepth, 1).name('Sample Count');
        this.gui.add(this, 'slabCentre', 0, maxDepth, 1).name('Slab Centre');
        this.gui.add(this, 'wWidth', 0, 0.05).name('Window Width');
        this.gui.add(this, 'wLevel', 0.48, 0.52, 0.0001).name('Window Level');
        this.gui.add({destroyRenderer: manager.destroyRenderer.bind(manager, this.renderID)}, 'destroyRenderer').name('Delete');
    }

    public getComputeSettings(): Float32Array { return new Float32Array([this.slabCentre, this.noSamples]); } 
    public getRenderSettings(): Float32Array { return new Float32Array([this.wWidth, this.wLevel]); }
}

export class SettingsSVR extends RendererSettings {

    private shininess: number = 50;
    private brightness: number = 1;
    private lightColour: number[] = [1, 1, 1];
    private includeSpecular: boolean = true;

    private xStart: number;
    private xEnd: number; 
    private yStart: number;
    private yEnd: number;
    private zStart: number;
    private zEnd: number;

    constructor(renderID: number, manager: RendererManager) {
        super(renderID, manager);
        this.gui.title('SVR Settings');

        this.xStart = this.yStart = this.zStart = 0;
        [this.xEnd, this.yEnd, this.zEnd] = manager.getContext().getVolume().size;

        let transferFunctionController = this.gui.add(manager.getContext().getTransferFunction(), 'filename', manager.getContext().getTransferFunctionIDs())
        transferFunctionController.name('Transfer Function');

        transferFunctionController.onChange(async transferFunctionID => {
            await manager.getContext().loadTransferFunction(transferFunctionID);
            manager.reloadRenderer(this.renderID);
        });

        this.gui.add(this, 'xStart', 0, this.xEnd, 1).name('X Start');
        this.gui.add(this, 'xEnd', 0, this.xEnd, 1).name('X End');
        this.gui.add(this, 'yStart', 0, this.yEnd, 1).name('Y Start');
        this.gui.add(this, 'yEnd', 0, this.yEnd, 1).name('Y End');
        this.gui.add(this, 'zStart', 0, this.zEnd, 1).name('Z Start');
        this.gui.add(this, 'zEnd', 0, this.zEnd, 1).name('Z End');
        this.gui.add(this, 'shininess', 0, 100).name('Shininess');
        this.gui.add(this, 'brightness', 0, 2).name('Brightness');
        this.gui.addColor(this, 'lightColour').name('Light Colour');
        this.gui.add(this, 'includeSpecular').name('Include Specular');
        this.gui.add({destroyRenderer: manager.destroyRenderer.bind(manager, this.renderID)}, 'destroyRenderer').name('Delete');
    }

    public getColour(): number[] {
        if (this.includeSpecular) return this.lightColour;
        else return [0, 0, 0];
    }

    public getComputeSettings(): Float32Array { 
        let slab = [this.xStart, this.xEnd, this.yStart, this.yEnd, this.zStart, this.zEnd]
        return new Float32Array([...this.getColour(), this.brightness, ...slab, this.shininess]); 
    }
}