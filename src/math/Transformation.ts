import * as gl from "gl-matrix";

export class Transformation {
    public translation: gl.vec4;
    public rotation: number; // radians
    public rotationCenter: gl.vec4;

    constructor() {
        this.translation = gl.vec4.create();
        this.rotation = 0;
        this.rotationCenter = gl.vec4.create();
    }

    public transform(vec: gl.vec4): gl.vec4 {
        // make the rotation center be the center by moving point towards center by rotation center
        // rotate by degrees
        // move back by adding rotation center;
        // translate by translation;

        const mat = gl.mat4.create();
        const quat = gl.quat.create();

        gl.quat.fromEuler(quat, 0, 0, this.rotation);

        gl.mat4.fromRotationTranslationScaleOrigin(
            mat,
            quat,
            this.translation,
            gl.vec3.fromValues(1, 1, 1),
            this.rotationCenter);

        const result = gl.vec4.clone(vec);

        gl.vec4.transformMat4(result, result, mat);

        return result;
    }
}