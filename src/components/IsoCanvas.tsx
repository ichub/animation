import * as React from "react";
import * as Radium from "radium";
import * as gl from "gl-matrix";
import {Transformation} from "../math/Transformation";

@Radium
export class IsoCanvas extends React.Component<any, IIsoCanvasState> {
    refs: {
        canvas: HTMLCanvasElement;
    };

    ctx: CanvasRenderingContext2D;

    circlePos = gl.vec2.fromValues(100, 100);
    circleVel = gl.vec2.fromValues(0, 0);
    gravity = 0.1;
    offsetX = 0;
    currentWaitingTime = 100;
    pausedVelocity = gl.vec2.fromValues(0, 0);

    img: HTMLImageElement;


    constructor() {
        super();

        this.state = {
            width: 800 * 0.75,
            height: 600 * 0.75,
            speedX: 1,
            speedY: 1,
            jumpWait: 100,
            circleRadius: 50,
        };

        this.img = document.createElement("img");
        this.img.src = "/background.jpg"
    }

    componentDidMount() {
        this.ctx = this.refs.canvas.getContext("2d");
        this.start();
    }

    start() {
        requestAnimationFrame(() => {
            this.frame();
            setTimeout(this.start.bind(this), 1000 / 60);
        });
    }

    draw() {
        this.ctx.drawImage(this.img, this.offsetX + this.img.naturalWidth, 0, this.img.naturalWidth, this.img.naturalHeight);
        this.ctx.drawImage(this.img, this.offsetX, 0, this.img.naturalWidth, this.img.naturalHeight);
        this.ctx.drawImage(this.img, this.offsetX - this.img.naturalWidth, 0, this.img.naturalWidth, this.img.naturalHeight);

        this.ctx.strokeStyle = "black";
        this.ctx.fillStyle = "white";
        this.ctx.beginPath();
        this.ctx.arc(this.circlePos[0], this.circlePos[1], this.state.circleRadius, 0, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.fill();
    }

    update() {
        if (this.currentWaitingTime < this.state.jumpWait) {
            this.currentWaitingTime++;
        } else {
            gl.vec2.add(this.circlePos, this.circlePos, this.circleVel);
            gl.vec2.add(this.circleVel, this.circleVel, gl.vec2.fromValues(0, this.gravity * this.state.speedY));

            if (this.circlePos[1] + this.state.circleRadius > this.state.height) {
                this.circleVel[1] = Math.abs(this.circleVel[1]) * -0.9;
                this.circlePos[1] = this.state.height - this.state.circleRadius;
                this.currentWaitingTime = 0;
            }

            if (this.offsetX < -this.img.naturalWidth) {
                this.offsetX = 0;
            } else if (this.offsetX > this.img.naturalWidth) {
                this.offsetX = 0;
            }

            this.offsetX -= this.state.speedX;
        }
    }

    frame() {
        this.ctx.clearRect(0, 0, this.state.width, this.state.height);

        this.draw();
        this.update();
    }

    public render() {
        return (
            <div>
                <canvas
                    style={style.canvas}
                    ref="canvas"
                    width={this.state.width}
                    height={this.state.height}/>
                <br/>
                <label>
                    speed x
                    <input
                        style={style.input}
                        type="range"
                        value={this.state.speedX}
                        onChange={e => {
                            this.setState<any>({
                                speedX: e.target.value
                            });
                        }}/>
                </label>

                <label>
                    speed y
                    <input
                        style={style.input}
                        type="range"
                        value={this.state.speedY}
                        onChange={e => {
                            this.setState<any>({
                                speedY: e.target.value
                            });
                        }}/>
                </label>

                <label>
                    jump interval
                    <input
                        style={style.input}
                        type="range"
                        value={this.state.jumpWait}
                        onChange={e => {
                            this.setState<any>({
                                jumpWait: e.target.value
                            });
                        }}/>
                </label>
                <br/>
                <label>
                    size
                    <input
                        style={style.input}
                        type="range"
                        value={this.state.circleRadius}
                        onChange={e => {
                            this.setState<any>({
                                circleRadius: e.target.value
                            });
                        }}/>
                </label>
            </div>

        );
    }
}

const style = {
    canvas: {
        border: "1px solid black"
    },
    input: {
        margin: "10px"
    }
};

interface IIsoCanvasState {
    width: number;
    height: number;
    speedX: number;
    speedY: number;
    jumpWait: number;
    circleRadius: number;
}