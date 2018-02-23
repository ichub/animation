import * as React from "react";
import * as Radium from "radium";
import * as gl from "gl-matrix";
import {Transformation} from "../math/Transformation";

@Radium
export class IsoCanvas extends React.Component<any, IIsoCanvasState> {
    refs: {
        canvas: HTMLCanvasElement;
    };

    ctx: WebGLRenderingContext;

    points: gl.vec4[] = [];
    connections: Array<{ firstIndex: number, secondIndex: number }> = [];
    frameCount = 0;
    transformation = new Transformation();

    xCount = 50;
    yCount = 50;

    squareSize = 30;

    triangleVertexPositionBuffer;

    perspectiveMatrix: gl.mat4;


    constructor() {
        super();

        this.state = {
            width: 800 * 0.75,
            height: 600 * 0.75
        };
    }

    componentDidMount() {
        this.ctx = this.refs.canvas.getContext("webgl");
        this.init();
        this.start();

        window.addEventListener("resize", () => {
            this.setState<any>({
                width: window.innerWidth,
                height: window.innerHeight
            }, () => {
                this.reset();
            });
        });
    }

    start() {
        requestAnimationFrame(() => {
            this.frame();
            this.frameCount++;

            setTimeout(this.start.bind(this), 1000 / 60);
        });
    }

    reset() {
        this.points = [];
        this.connections = [];
        this.init();
    }

    init() {
        this.perspectiveMatrix = gl.mat4.create();

        for (let i = 0; i < this.xCount; i++) {
            for (let j = 0; j < this.yCount; j++) {
                this.points.push(gl.vec4.fromValues(
                    i * this.squareSize,
                    j * this.squareSize, 0, 1));
            }
        }

        for (let i = 0; i < this.points.length; i++) {
            let xy = this.indexToXY(i);

            for (let con of this.getConnections(xy.x, xy.y)) {
                if (con.x < this.xCount && con.y < this.yCount) {
                    this.connections.push({
                        firstIndex: i,
                        secondIndex: this.XYToIndex(con)
                    });
                }
            }
        }

        // Set clear color to black, fully opaque
        this.ctx.clearColor(0.0, 0.0, 0.0, 1.0);
        // Clear the color buffer with specified clear color
        this.ctx.clear(this.ctx.COLOR_BUFFER_BIT);

        this.triangleVertexPositionBuffer = this.ctx.createBuffer();
        this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.triangleVertexPositionBuffer);

        var vertices = [
            0.0, 1.0, 0.0,
            -1.0, -1.0, 0.0,
            1.0, -1.0, 0.0
        ];

        this.ctx.bufferData(this.ctx.ARRAY_BUFFER, new Float32Array(vertices), this.ctx.STATIC_DRAW);

        this.triangleVertexPositionBuffer.itemSize = 3;
        this.triangleVertexPositionBuffer.numItems = 3;
    }

    indexToXY(i: number): { x, y } {
        let x = i % this.xCount;
        let y = Math.floor(i / this.yCount);

        return {x, y};
    }

    XYToIndex(xy: { x, y }): number {
        return xy.y * this.xCount + xy.x;
    }

    getConnections(x: number, y: number): Array<{ x: number, y: number }> {
        let res = [];

        if (x % 2 == 0 && y % 2 == 0) {
            res.push({x: x + 1, y: y + 1});
            res.push({x: x + 1, y: y + 2});
        }

        return res;
    }

    frame() {
        this.transformation.rotationCenter = gl.vec3.fromValues(this.squareSize * this.xCount / 2, this.squareSize * this.yCount / 2, 0);
        this.transformation.rotation = Math.PI / 4 * this.frameCount;
        this.transformation.translation = gl.vec4.fromValues(this.state.width / 2 - this.squareSize * this.xCount / 2, this.state.height / 2 - this.squareSize * this.yCount / 2, 0, 1);

        // this.ctx.clearRect(0, 0, this.state.width, this.state.height);

        const poses = [];

        for (let i = 0; i < this.points.length; i++) {
            const pos = this.transformation.transform(this.points[i]);
            poses.push(pos);

            // this.ctx.fillRect(pos[0], pos[1], 2, 2);
        }

        for (let con of this.connections) {
            let p1 = poses[con.firstIndex];
            let p2 = poses[con.secondIndex];

            if (p1 && p2) {
                // this.ctx.beginPath();
                // this.ctx.moveTo(p1[0], p1[1]);
                // this.ctx.lineTo(p2[0], p2[1]);
                // this.ctx.stroke();
            }
        }

        this.ctx.viewport(0, 0, this.state.width, this.state.height);
        this.ctx.clear(this.ctx.COLOR_BUFFER_BIT | this.ctx.DEPTH_BUFFER_BIT);

        gl.mat4.perspective(this.perspectiveMatrix, 45, this.state.width / this.state.height, 0.1, 100.0,);
        this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.triangleVertexPositionBuffer);
        this.ctx.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.triangleVertexPositionBuffer.itemSize, this.ctx.FLOAT, false, 0, 0);

    }

    public render() {
        return (
            <canvas
                style={style.canvas}
                ref="canvas"
                width={this.state.width}
                height={this.state.height}/>
        );
    }
}

const style = {
    canvas: {}
};

interface IIsoCanvasState {
    width: number;
    height: number;
}