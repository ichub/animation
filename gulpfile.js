"use strict";
const gulp = require("gulp");
const sass = require("gulp-sass");
const server = require("gulp-server-livereload");
const watch = require("gulp-watch");
const browserify = require("gulp-browserify");
const glob = require("multi-glob").glob;
const path = require("path");
const uglify = require("gulp-uglify");
const cssnano = require("gulp-cssnano");
const ts = require("gulp-typescript");
const tslint = require("gulp-tslint");
const tsfmt = require("gulp-tsfmt");
const babel = require("gulp-babel");
const rename = require("gulp-rename");
const fs = require("fs");
const gutil = require("gulp-util");
const nodemon = require("gulp-nodemon");
const webpack = require("gulp-webpack");
const sourcemaps = require("gulp-sourcemaps");
const exec = require("child_process").exec;

let sassGlob = "./sass/everything.scss";
let tsGlob = "./src/**/*.@(ts|tsx)";
let jsonGlob = "resources/data.json";
let typingsGlob = "./typings/**/*.ts";

gulp.task("default", ["serve"]);
gulp.task("build", ["sass", "webpack"]);

gulp.task("webpack", ["ts"], function () {
    return gulp.src("dist/ui/App.js")
        .pipe(webpack({
            module: {
                loaders: [
                    {test: /\.json/, loader: "json-loader"},
                ],
            },
        }))
        .pipe(rename("bundle.js"))
        .pipe(gulp.dest("dist/bundle"));
});

gulp.task("ts", function () {
    return gulp.src([tsGlob, typingsGlob])
        .pipe(sourcemaps.init())
        .pipe(ts({
            declaration: false,
            module: "commonjs",
            target: "es2017",
            experimentalDecorators: true,
            jsx: "react"
        }))
        // .pipe(sourcemaps.write()) // Now the sourcemaps are added to the .js file
        .pipe(gulp.dest("dist"));
});

gulp.task("sass", function () {
    gulp.src(sassGlob)
        .pipe(sass().on("error", sass.logError))
        .pipe(rename("bundle.css"))
        .pipe(gulp.dest("./css"))
        .pipe(cssnano())
        .pipe(rename("bundle.min.css"))
        .pipe(gulp.dest("./css"));
});

gulp.task("serve", ["watch"], function () {
    nodemon({
        script: "./dist/server/Server.js",
        env: {"NODE_ENV": "development"}
    });
});

gulp.task("watch", ["sass", "webpack"], function () {
    gulp.watch("./sass/**/*.scss", ["sass"]);
    gulp.watch([tsGlob, jsonGlob], ["webpack"]);
});

gulp.task("prod", /*["sass", "webpack"],*/ function () {
    exec("forever", //forever stopall && forever start ./dist/server/Server.js
        {
            env: {
                "NODE_ENV": "production",
            }
        },
        function (error, stdout, stderr) {
            console.log("stdout: " + stdout);
            console.log("stderr: " + stderr);
        });
});