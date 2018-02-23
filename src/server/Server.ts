import * as express from "express";
import * as bodyParser from "body-parser";
import * as path from "path";
import * as fs from "fs";
import * as https from "https";

export const rootPath = path.join(__dirname, "../../");
export const certsPath = path.join(rootPath, "certs");
export const htmlDir = path.join(rootPath, "html");
export const jsDir = path.join(rootPath, "dist", "bundle");
export const staticDir = path.join(rootPath, "static");
export const resDir = path.join(staticDir, "resources");
export const cssDir = path.join(rootPath, "css");

export const IS_DEBUG = process.env.NODE_ENV === "production";

const app = express();

app.use(require("helmet")());

app.use((req: express.Request, res, next) => {
    console.log(`REQUEST: ${req.method} ${req.path}`);
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
    res.sendFile(path.join(htmlDir, "index.html"));
});

app.use("/js", express.static(jsDir));
app.use(express.static(staticDir));
app.use((req, res, next) => {
    if (req.url.endsWith(".base64")) {
        let imgPath = path.join(staticDir, req.path);
        imgPath = imgPath.substr(0, imgPath.length - ".base64".length);


        res.contentType("text/plain");
        res.send("data:image/png;base64," + fs.readFileSync(imgPath).toString("base64"));
        return;
    }

    next();
});

app.use("/css", express.static(cssDir));

app.use((err, req, res, next) => {
    console.log(`ERROR: ${JSON.stringify(err)}`);

    next(err);
});

app.get("/favicon.ico", (req, res) => res.sendfile("resources/favicon.ico"));

// Force https in production
if (process.env.NODE_ENV === 'production') {
    app.use(function(req, res, next) {
        if (req.headers['x-forwarded-proto'] !== 'https') {
            return res.redirect(['https://', req.get('Host'), req.url].join(''));
        }
        return next();
    });
}

const DEBUG_PORT = 4000;
const PROD_PORT = 80;
const DEBUG_SSL_PORT = 4443;
const PROD_SSL_PORT = 443;

let port;
let sslPort;

if (IS_DEBUG) {
    port = PROD_PORT;
    sslPort = PROD_SSL_PORT;
} else {
    port = DEBUG_PORT;
    sslPort = DEBUG_SSL_PORT;
}

const options = {
    cert: fs.readFileSync(path.join(certsPath, 'fullchain.pem')),
    key: fs.readFileSync(path.join(certsPath, 'privkey.pem'))
};

app.listen(port, () => console.log(`started http on port: ${port}`));
https.createServer(options, app).listen(sslPort, () => console.log(`started https on port: ${sslPort}`));
