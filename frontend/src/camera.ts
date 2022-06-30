import { mat4, vec3 } from 'gl-matrix';

export class Camera {
    private viewDirection: vec3 = vec3.create(); // Vector pointing towards volume
    private viewUp: vec3 = vec3.create();
    private viewSide: vec3 = vec3.create();
    private imageSpacePanCine: vec3 = vec3.create();

    private imageBoundingBox: vec3;
    private boundingBox: vec3;
    private scale: vec3;

    private camera: mat4 = mat4.create();
    private view: mat4 = mat4.create();

    private boundingBoxScale: number;

    constructor(imageWidth: number, imageHeight: number, boundingBox: number[]) {
        this.imageBoundingBox = vec3.fromValues(imageWidth, imageHeight, 0);
        this.boundingBox = vec3.fromValues(boundingBox[0], boundingBox[1], boundingBox[2]);
        this.boundingBoxScale = this.imageBoundingBox[0] / this.boundingBox[0];

        this.setScale(this.boundingBoxScale);
        //this.setViewDirection(vec3.fromValues(0, 0, 1), vec3.fromValues(0, -1, 0));
        this.setViewDirection(vec3.fromValues(1, 0, 0), vec3.fromValues(0, -1, 0));
    }

    private CalculateViewMatrix() {
        this.camera = mat4.create();

        let viewBasisMatrix: mat4 = mat4.fromValues(
            this.viewSide[0], this.viewUp[0], this.viewDirection[0], 0,
            this.viewSide[1], this.viewUp[1], this.viewDirection[1], 0,
            this.viewSide[2], this.viewUp[2], this.viewDirection[2], 0,
            0, 0, 0, 1
        )

        // Centre volume
        mat4.multiply(this.camera, this.camera, mat4.fromTranslation(mat4.create(), this.boundingBoxCentre()));
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

    public getCameraMatrix() { this.CalculateViewMatrix(); return this.camera as Float32Array; }
    public getViewMatrix() { this.CalculateViewMatrix(); return this.view as Float32Array; }
    public getViewMatrixByteLength() { return (this.view as Float32Array).byteLength }

    private boundingBoxCentre() {
        return vec3.fromValues(-this.boundingBox[0] / 2, -this.boundingBox[1] / 2, -this.boundingBox[2] / 2);
    }

    private imageCentre() {
        return vec3.fromValues(this.boundingBox[0] / this.scale[0] - this.boundingBox[0] / 2, this.boundingBox[1] / this.scale[1] - this.boundingBox[1] / 2, 0);
    }

    public setScale(s: number) {
        this.scale = vec3.fromValues(s, s, 1);
        vec3.multiply(this.scale, this.scale, vec3.fromValues(this.boundingBoxScale, this.boundingBoxScale, 1));
    }

    private setViewDirection(viewDirection: vec3, viewUp: vec3) {
        let viewSide: vec3 = vec3.create();
        vec3.cross(viewSide, viewDirection, viewUp);
        vec3.cross(this.viewUp, viewDirection, viewSide);
        this.viewDirection = viewDirection;
        this.viewSide = viewSide;
    }

    public rotateView(dx: number, dy: number) {
        vec3.transformMat4(this.viewDirection, this.viewDirection, mat4.fromRotation(mat4.create(), dx, this.viewUp));
        vec3.transformMat4(this.viewSide, this.viewSide, mat4.fromRotation(mat4.create(), dx, this.viewUp));
        vec3.transformMat4(this.viewDirection, this.viewDirection, mat4.fromRotation(mat4.create(), dy, this.viewSide));
        vec3.transformMat4(this.viewUp, this.viewUp, mat4.fromRotation(mat4.create(), dy, this.viewSide));
    }
}