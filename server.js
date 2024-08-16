const cluster = require("cluster");
import os from "os";
import Express from "express";
import fs from "fs";
import https from "https";
import http from "http";
import path from "path";

import "regenerator-runtime/runtime";

import __APIENV__ from "./env.json";

import webpack from "webpack";
import webpackDevMiddleware from "webpack-dev-middleware";
import webpackConfig from "./webpack.config.js";

import SHAPES from './client/assets/availableshapes.json';

const compiler = webpack(webpackConfig);

if(cluster.isMaster && !__APIENV__.isDev && __APIENV__.clusterenabled) {
    //var numWorkers = require("os").cpus().length;
    const numWorkers = os.cpus().length;

    console.log("Master cluster setting up " + numWorkers + " workers...");

    for(var i = 0; i < numWorkers; i++) {
        cluster.fork();
    }

    cluster.on("online", (worker)=>{
        console.log("Worker " + worker.process.pid + " is online");
    });

    cluster.on("exit", (worker, code, signal)=>{
        console.log("Worker " + worker.process.pid + " died with code: " + code + ", and signal: " + signal);
        console.log("Starting a new worker");
        cluster.fork();
    });
} else {

    const app = Express();
    const port = isNaN(__APIENV__.serviceport) ? parseInt(__APIENV__.serviceport) : __APIENV__.serviceport;

    app.use(webpackDevMiddleware(compiler, {
        noInfo: false,
        quiet: false,
        stats: "minimal",
        path: path.resolve(__dirname, "dist"),
        publicPath: "",
        watch:true,
        watchOptions: {
            aggregateTimeout: 300,
            poll: true
        }
    }));

    app.get("/files", (req, res)=>{
        const trainingdata = [];

        for(var i=0; i<SHAPES.length; i++){
            const trainingfiles = fs.readdirSync(path.resolve(__dirname, "trainingimages", `${SHAPES[i].name}`));

            trainingfiles.forEach(filename=>{
                trainingdata.push({
                    shape: SHAPES[i].name,
                    file: filename,
                    url: `/image/${SHAPES[i].name}/${filename}`,
                    autogen: false,
                    target: i
                });
            });
        }

        const preppedresponse = {
            training: shuffleData(trainingdata)
        }

        res.status(200).json(preppedresponse);
    });
    app.get("/identityfiles", (req, res)=>{
        const identityfiles = fs.readdirSync(path.resolve(__dirname, "trainingimages", "identity_images"));
        const identityfiledata = identityfiles.map(filename=>{
            return {
                shape: filename.split("_identity")[0],
                url: `/image/identity_images/${filename}`
            }
        });

        res.status(200).json(identityfiledata);
    });

    app.use("/image", Express.static(path.resolve(__dirname,"trainingimages")));
    app.use("/premademodels", Express.static(path.resolve(__dirname,"model")));
    app.use("/", Express.static(path.resolve(__dirname,"dist")));
    app.use(handleRender);

    async function handleRender(req, res) {
        try{
            res.send(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <meta charset="utf-8">

                        <meta name="viewport" content="width=device-width, initial-scale=1.0">

                        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
                        <meta http-equiv="Pragma" content="no-cache" />
                        <meta http-equiv="Expires" content="0" />

                        <title>Gesture Trainer</title>
                        
                        <style>
                            body{
                                overscroll-behavior-y: none;
                                overscroll-behavior-x: none;
                                padding: 0;
                                margin: 0;
                                font-family: Calibri,Candara,Segoe,Segoe UI,Optima,Arial,sans-serif; 
                            }
                        </style>

                    </head>
                    <body>
                        <main-app></main-app>

                        <script type="module" src="/js/appbundle.js"></script>
                    </body>
                </html>
            `);
        }catch(err){
            console.log(err);
        }
    }


    let _httpserver;

    if(__APIENV__.SSL.enabled && fs.existsSync(__APIENV__.SSL.keyfilepath) && fs.existsSync(__APIENV__.SSL.certfilepath)){
        _httpserver = https.createServer({
            key: fs.readFileSync(__APIENV__.SSL.keyfilepath),
            cert: fs.readFileSync(__APIENV__.SSL.certfilepath)
        }, app);
    }
    else{
        _httpserver = http.Server(app);
    }

    _httpserver.listen(port, (err)=>{
        if(err){
            console.log("App Server could not start");
        }
        console.log("Application started @ port "+port+" on Cluster Process: "+process.pid+" in "+(__APIENV__.SSL.enabled ? "SSL" : "Normal")+" mode.");
    });


    function shuffleData(_arr){
        for (var i = _arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [_arr[i], _arr[j]] = [_arr[j], _arr[i]];
        }
        return _arr;
    }

}