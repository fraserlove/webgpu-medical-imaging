import { mat4, vec3 } from 'gl-matrix';

export class Camera {
    private viewDir: vec3; // Points towards volume - z-axis for camera
    private viewUp: vec3; // Points upwards from top of camera - x-axis for camera
    private viewSide: vec3; // Points parallel to image plane - y-axis for camera

    private imageSpacePanCine: vec3;
    private scale: vec3;

    private camera: mat4;
    private view: mat4;

    private lightDir: vec3;

    private imageSize: number[];
    private volumeBounds: number[];
    private volumeDataScale: number;

    constructor(volume: any) {
        this.volumeBounds = volume.boundingBox;
        this.volumeDataScale = volume.boundingBox[2] / volume.size[2];

        this.viewDir = this.viewUp = this.viewSide = vec3.create();
        this.camera = this.view = mat4.create();
        this.lightDir = vec3.create();

        this.setLighting(1, 0);
        this.setScale(0.4);
        this.setPanCine(0, 0, this.volumeBounds[2] / 2);
        this.setViewDir(vec3.fromValues(0, 1, 0), vec3.fromValues(0, 0, 1));
    }

    private CalculateViewMatrix(): void {
        this.camera = mat4.create();

        let viewBasisMatrix: mat4 = mat4.fromValues(
            this.viewSide[0], this.viewUp[0], this.viewDir[0], 0,
            this.viewSide[1], this.viewUp[1], this.viewDir[1], 0,
            this.viewSide[2], this.viewUp[2], this.viewDir[2], 0,
            0, 0, 0, 1
        )
        // Scale z-axis according to volume-to-data ratio
        mat4.multiply(this.camera, mat4.fromScaling(mat4.create(), vec3.fromValues(1, 1, this.volumeDataScale)), this.camera);
        // Centre volume
        mat4.multiply(this.camera, mat4.fromTranslation(mat4.create(), this.volumeCentre()), this.camera);
        // Apply rotation
        mat4.multiply(this.camera, viewBasisMatrix, this.camera);
        // Apply cine-pan transformation
        mat4.multiply(this.camera, mat4.fromTranslation(mat4.create(), this.imageSpacePanCine), this.camera);
        // Apply scaling transformation
        mat4.multiply(this.camera, mat4.fromScaling(mat4.create(), this.scale), this.camera);
        // Re-centre the image in the window
        mat4.multiply(this.camera, mat4.fromTranslation(mat4.create(), this.imageCentre()), this.camera);
        mat4.invert(this.view, this.camera);
    }

    public getCameraMatrix(): Float32Array { this.CalculateViewMatrix(); return this.camera as Float32Array; }
    public getViewMatrix(): Float32Array { this.CalculateViewMatrix(); return this.view as Float32Array; }
    public getLightDir(): Float32Array { return this.lightDir as Float32Array; }

    private volumeCentre(): vec3 { return vec3.fromValues(-this.volumeBounds[0] / 2, -this.volumeBounds[1] / 2, -this.volumeBounds[2] / 2); }
    private imageCentre(): vec3 { return vec3.fromValues(this.imageSize[0] / 2, this.imageSize[1] / 2, 0); }

    private setViewDir(viewDir: vec3, viewUp: vec3): void {
        let viewSide: vec3 = vec3.create();
        vec3.cross(viewSide, viewDir, viewUp);
        vec3.cross(this.viewUp, viewDir, viewSide);
        this.viewDir = viewDir;
        this.viewSide = viewSide;
    }

    private setScale(s: number): void {
        if (s > 0) this.scale = vec3.fromValues(s, s, 1);
    }

    private setPanCine(x: number, y: number, z: number): void {
        this.imageSpacePanCine = vec3.fromValues(x, y, z);
    }

    public updateCine(dz: number): void {
        this.imageSpacePanCine[2] += dz;
    }

    public updatePan(dx: number, dy: number): void {
        this.imageSpacePanCine[0] += dx / this.scale[0];
        this.imageSpacePanCine[1] += dy / this.scale[1];
    }

    public updateScale(ds: number): void {
        if (this.scale[0] + ds > 0) {
            this.scale[0] += ds;
            this.scale[1] += ds;
        }
    }

    public updateRotation(dx: number, dy: number): void {
        vec3.transformMat4(this.viewDir, this.viewDir, mat4.fromRotation(mat4.create(), dx, this.viewUp));
        vec3.transformMat4(this.viewSide, this.viewSide, mat4.fromRotation(mat4.create(), dx, this.viewUp));
        vec3.transformMat4(this.viewDir, this.viewDir, mat4.fromRotation(mat4.create(), dy, this.viewSide));
        vec3.transformMat4(this.viewUp, this.viewUp, mat4.fromRotation(mat4.create(), dy, this.viewSide));
    }

    public setLighting(long: number, lat: number): void {
        this.lightDir[0] = Math.cos(lat) * Math.cos(long);
        this.lightDir[1] = Math.cos(lat) * Math.sin(long);
        this.lightDir[2] = Math.sin(lat);
        vec3.normalize(this.lightDir, this.lightDir);
    }

    public updateLighting(dlong: number, dlat: number): void {
        let lat = (Math.asin(this.lightDir[2])) + dlat;
        let long = ((Math.atan2(this.lightDir[1], this.lightDir[0]))) + dlong;
        this.setLighting(long, lat);
    }

    public resize(size: number[]): void { this.imageSize = size; }
}