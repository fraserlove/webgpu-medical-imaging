import { mat4, vec3 } from 'gl-matrix';

export class Camera {
    private x: number = 0;
    private y: number = 0;
    private z: number = 0;

    private rotX: number = 0;
    private rotY: number = 0;
    private rotZ: number = 0;

    private scaleX: number = 1;
    private scaleY: number = 1;
    private scaleZ: number = 1;

    aspect: number = 16 / 9;

    private view: mat4;

    constructor(aspect: number) {
        this.aspect = aspect;
        this.view = mat4.create();
    }

    public getViewMatrix() {
        mat4.translate(this.view, this.view, vec3.fromValues(this.x, this.y, this.z));
        mat4.rotateX(this.view, this.view, this.rotX);
        mat4.rotateY(this.view, this.view, this.rotY);
        mat4.rotateZ(this.view, this.view, this.rotZ);
        mat4.scale(this.view, this.view, vec3.fromValues(this.scaleX, this.scaleY, this.scaleZ));
        return this.view as Float32Array;
    }

    public rotate(rotX, rotY, rotZ) {
        this.rotX = rotX;
        this.rotY = rotY;
        this.rotZ = rotZ;
    }

    public translate(dx, dy, dz) {
        this.x = dx;
        this.y = dy;
        this.z = dz;
    }

    public scale(sx, sy, sz) {
        this.scaleX += sx;
        this.scaleY += sy;
        this.scaleZ += sz;
    }

}