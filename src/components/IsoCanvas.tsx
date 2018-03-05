import * as React from "react";
import * as Radium from "radium";
import * as gl from "gl-matrix";
import {Transformation} from "../math/Transformation";

declare class GIFEncoder {

}

@Radium
export class IsoCanvas extends React.Component<any, IIsoCanvasState> {
    refs: {
        canvas: HTMLCanvasElement;
    };

    ctx: CanvasRenderingContext2D;

    circlePos;
    circleVel;
    offsetX;
    currentWaitingTime;
    strokeSize = 5;

    img: HTMLImageElement;
    encoder: any;

    framesToRecord = 60 * 5;
    recordedFrames = 0;
    permutations = [];
    currentPermutation = 0;
    jumping = true;
    firstContact = false;
    moving = true;
    recording = false;

    constructor() {
        super();

        this.resetState();

        this.img = document.createElement("img");
        this.img.src = "/background.png";

        this.permutations = this.generatePermutations([]);
        this.encoder = new GIFEncoder();
        this.encoder.setRepeat(0);
        this.encoder.setDelay(Math.floor(1000 / 60)); //go to next frame every n milliseconds
    }

    currentPermutationToName() {
        let perm = this.permutations[this.currentPermutation - 1];
        let result = "";

        for (let item of perm) {
            for (let name of Object.keys(item)) {
                result += name + "_" + item[name].toString().replace(".", "-");
                this.state[name] = item[name];
            }
        }

        return result + ".gif";
    }

    loadNextPermutation() {
        if (this.currentPermutation >= this.permutations.length) {
            alert("done");
            return;
        }

        let perm = this.permutations[++this.currentPermutation];

        for (let item of perm) {
            for (let name of Object.keys(item)) {
                this.state[name] = item[name];
            }
        }

        this.setState<any>(this.state);
    }

    resetState() {
        this.state = {
            width: 300,
            height: 300,
            speedX: 1,
            speedY: 4,
            jumpWait: 100,
            circleRadius: 50,
            gravity: 1
        };
        this.offsetX = 0;
        this.circlePos = gl.vec2.fromValues(100, this.state.height);
        this.circleVel = gl.vec2.fromValues(0, 0);
        this.currentWaitingTime = 99;
        this.firstContact = true;
    }

    generatePermutations(used) {
        let potential = {
            "speedX": [1, 20],
            "speedY": [4, 1],
            "gravity": [0.3],
            "jumpWait": [50, 500],
            "circleRadius": [50]
        };

        let perm = [];

        // choose the next non fixed item
        let current = null;
        for (let name of Object.keys(potential)) {
            if (used.indexOf(name) == -1) {
                current = name;
                break;
            }
        }

        if (current == null) {
            return [[]];
        }

        let options = potential[current];

        used.push(current);
        let next = this.generatePermutations(used);
        used.pop(current);

        let perms = [];

        for (let tail of next) {
            for (let option of options) {
                perms.push([{[current]: option}, ...tail]);
            }
        }

        return perms;
    }

    componentDidMount() {
        this.ctx = this.refs.canvas.getContext("2d");
        this.resetState();
        this.loadNextPermutation();
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
        this.ctx.lineWidth = this.strokeSize;
        this.ctx.beginPath();
        this.ctx.arc(this.circlePos[0], this.circlePos[1], this.state.circleRadius, 0, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.fill();

        if (this.recording) {
            if (this.recordedFrames == 0) {
                this.encoder.start();
            }

            if (this.recordedFrames++ < this.framesToRecord) {
                this.encoder.addFrame(this.ctx);
                console.log("recorded frame: " + this.recordedFrames);
            } else {

                this.encoder.finish();
                this.encoder.download(this.currentPermutationToName());
                this.resetState();
                this.loadNextPermutation();
                this.recordedFrames = 0;
            }
        }
    }

    update() {
        gl.vec2.add(this.circlePos, this.circlePos, this.circleVel);
        gl.vec2.add(this.circleVel, this.circleVel, gl.vec2.fromValues(0, this.state.gravity / 10 * this.state.speedY));


        if (this.circlePos[1] + this.state.circleRadius + this.strokeSize / 2 > this.state.height) {
            this.jumping = false;
            this.currentWaitingTime = 0;
            this.circleVel[1] = 0;
            this.circlePos[1] = this.state.height - this.state.circleRadius - this.strokeSize / 2;
        }

        if (this.currentWaitingTime < this.state.jumpWait && !this.jumping) {
            this.currentWaitingTime++;
        } else {
            this.jumping = true;
            this.currentWaitingTime = 0;
            this.circleVel[1] = -this.state.speedY;

        }

        if (this.offsetX < -this.img.naturalWidth) {
            this.offsetX = 0;
        } else if (this.offsetX > this.img.naturalWidth) {
            this.offsetX = 0;
        }

        if (this.moving) {
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
                        step={0.1}
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
                <label>
                    gravity
                    <input
                        style={style.input}
                        type="range"
                        value={this.state.gravity}
                        min={0.05}
                        max={1}
                        step={0.05}
                        onChange={e => {
                            this.setState<any>({
                                gravity: e.target.value
                            });
                        }}/>
                </label>
            </div>

        );
    }
}

const style = {
    canvas: {
        border: "1px solid black",
        marginBottom: 150
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
    gravity: number;
    circleRadius: number;
}