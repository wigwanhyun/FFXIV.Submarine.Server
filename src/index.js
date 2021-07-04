"use strict";

const http = require("http");
const path = require("path");
const express = require("express");
const CryptoJS = require("crypto-js");

var firebase = require("firebase/app");
require("firebase/auth");
require("firebase/firestore");
require("firebase/database");

const functions = require('firebase-functions');
const aesKey = '0000000000@fsadqega#fkdlsaiqu1235' // 32자리 키 
const app = express();

const bodyParser  = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({limit: '50mb'})); 
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

  
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
    //res.header("Access-Control-Allow-Origin", "http://127.0.0.1:5500");
    res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type");
    res.header('Access-Control-Allow-Credentials', 'true'); 
    next();
  });

// app.get("/getList", (req, res) => {
//     var database   = firebase.database();
//     database.ref('/').orderByChild("Name").once('value')
//     .then(function(snapshot) {
//         var sJson = JSON.stringify(snapshot.val());
//         var oJson = JSON.parse(sJson);

//         var oKeys = Object.keys(oJson);

//         var dataSet = [];
//         oKeys.forEach(element => {
//             let oData = oJson[element];
//             dataSet.push([oData.Name, oData.Tear1Reward, oData.Tear2Reward, oData.Tear3Reward]);
//         })
//         res.writeHead(200, {'Content-Type':'application/json'});
//         res.end(JSON.stringify(dataSet));
//     })
// });


app.get("/share", (req, res) => {
    let { s } = req.query;

    var database   = firebase.database();
    database.ref('/share/' + s).once('value')
    .then(function(snapshot) {
        var sJson = JSON.stringify(snapshot.val());
        //var oJson = JSON.parse(sJson);
        res.writeHead(200, {'Content-Type':'application/json'});
        res.end(sJson);
    })
});

app.post("/makeshare", (req, res) => {
    let { puzzleParam } = req.body;
    let database   = firebase.database();
    let puzzleId = encrypt(getCurrentDate());
    let replaceEncId = puzzleId.replace(/\+/gi,'xMl3Jk').replace(/\//gi,'Por21Ld').replace(/=/gi,'Ml32');
    var postData = {
        id: replaceEncId,
        puzzleParam: puzzleParam,
    };
    
    var updates = {};
    updates['/share/' + replaceEncId] = postData;
    
    
    database.ref().update(updates);

    res.end(JSON.stringify({
        "shareID" : replaceEncId
    }));


});


function encrypt (plainText) 
{ 
    let key = CryptoJS.enc.Utf8.parse(aesKey); 
    let iv = CryptoJS.enc.Hex.parse("0000000000000000"); 
    let encrypt = CryptoJS.AES.encrypt(plainText, key, {iv:iv}); 
    return encrypt.toString();
}; 


function getCurrentDate()
{
    var date = new Date();
    var year = date.getFullYear().toString();

    var month = date.getMonth() + 1;
    month = month < 10 ? '0' + month.toString() : month.toString();

    var day = date.getDate();
    day = day < 10 ? '0' + day.toString() : day.toString();

    var hour = date.getHours();
    hour = hour < 10 ? '0' + hour.toString() : hour.toString();

    var minites = date.getMinutes();
    minites = minites < 10 ? '0' + minites.toString() : minites.toString();

    var seconds = date.getSeconds();
    seconds = seconds < 10 ? '0' + seconds.toString() : seconds.toString();

    var miliSeconds = date.getMilliseconds();
    

    return year + month + day + hour + minites + seconds + "" + miliSeconds;
}

app.use("/public", express.static(path.join(__dirname, "public")));

const port = process.env.PORT || "3000";
app.set("port", port);

http.createServer(app).listen(port);
