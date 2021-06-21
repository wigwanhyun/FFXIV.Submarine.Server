"use strict";

const http = require("http");
const path = require("path");
const express = require("express");

var firebase = require("firebase/app");
require("firebase/auth");
require("firebase/firestore");
require("firebase/database");
const functions = require('firebase-functions');

const app = express();

const bodyParser  = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({limit: '50mb'})); 
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));



출처: https://beagle-dev.tistory.com/229 [언젠간 되어있겠지]

출처: https://beagle-dev.tistory.com/229 [언젠간 되어있겠지]
var firebaseConfig = {
    apiKey: "AIzaSyCeCE4isza3dgdqU_MeOcuhvFJPrLgJdEw",
    authDomain: "wiepuzzle.firebaseapp.com",
    projectId: "wiepuzzle",
    storageBucket: "wiepuzzle.appspot.com",
    messagingSenderId: "59626688751",
    appId: "1:59626688751:web:67d5fe96f7192b87520b1a",
    measurementId: "G-675EPYC7CZ"
};
firebase.initializeApp(firebaseConfig);


// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.get("/", (req, res) => {
    res.render("index", {
        envVariables: process.env,
        reqHeaders: req.headers,
        reqParams: req.query,
    });
});

app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "https://puzzle.girin.dev");
    res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type");
    res.header('Access-Control-Allow-Credentials', 'true'); 
    next();
  });

app.get("/getList", (req, res) => {
    var database   = firebase.database();
    database.ref('/').orderByChild("Name").once('value')
    .then(function(snapshot) {
        var sJson = JSON.stringify(snapshot.val());
        var oJson = JSON.parse(sJson);

        var oKeys = Object.keys(oJson);

        var dataSet = [];
        oKeys.forEach(element => {
            let oData = oJson[element];
            dataSet.push([oData.Name, oData.Tear1Reward, oData.Tear2Reward, oData.Tear3Reward]);
        })
        res.writeHead(200, {'Content-Type':'application/json'});
        res.end(JSON.stringify(dataSet));
    })
});


app.get("/share", (req, res) => {
    let { s } = req.query;

    var database   = firebase.database();
    database.ref('/share/' + s).once('value')
    .then(function(snapshot) {
        var sJson = JSON.stringify(snapshot.val());
        var oJson = JSON.parse(sJson);
        res.writeHead(200, {'Content-Type':'application/json'});
        res.end(sJson);
    })
});

app.post("/makeshare", (req, res) => {
    let { id, puzzleParam } = req.body;
    console.log(id)
    console.log(req)
    var database   = firebase.database();
    
    var postData = {
        id: id,
        puzzleParam: puzzleParam,
    };
    
    var updates = {};
    updates['/share/' + id] = postData;
    
    
    database.ref().update(updates);

    res.end("success");
});


app.use("/public", express.static(path.join(__dirname, "public")));

const port = process.env.PORT || "3000";
app.set("port", port);

http.createServer(app).listen(port);
