import { mat4, vec3 } from 'gl-matrix';

export class Camera {
    private position: vec3 = vec3.create();
    private rotation: vec3 = vec3.create();
    private scale: vec3 = vec3.fromValues(1, 1, 1);

    private view: mat4;
    private projection: mat4;
    private viewProjection: mat4;

    constructor() {
        this.projection = mat4.create();
        this.viewProjection = mat4.create();
        this.CalculateVPMatrix();
    }

    private CalculateVPMatrix() {
        this.view = mat4.create();
        mat4.translate(this.view, this.view, this.position);
        mat4.rotateX(this.view, this.view, this.rotation[0]);
        mat4.rotateY(this.view, this.view, this.rotation[1]);
        mat4.rotateZ(this.view, this.view, this.rotation[2]);
        mat4.scale(this.view, this.view, this.scale);
        mat4.invert(this.view, this.view);
        mat4.multiply(this.viewProjection, this.projection, this.view);
    }

    public getRotation() { return this.rotation; }
    public getPosition() { return this.position; }
    public getScale() { return this.scale; }
    public getViewMatrix() { return this.view as Float32Array; }
    public getProjectionMatrix() { return this.projection as Float32Array; }
    public getViewProjectionMatrix() { return this.viewProjection as Float32Array; }

    public setRotation(rx, ry, rz) {
        this.rotation = vec3.fromValues(rx, ry, rz);
        this.CalculateVPMatrix();
    }

    public setPosition(x, y, z) {
        this.position = vec3.fromValues(x, y, z);
        this.CalculateVPMatrix();
    }

    public setScale(sx, sy, sz) {
        this.scale = vec3.fromValues(sx, sy, sz);
        this.CalculateVPMatrix();
    }
}