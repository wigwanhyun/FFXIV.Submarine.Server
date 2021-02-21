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


var firebaseConfig = {
    apiKey: "AIzaSyDBl3p8u2LHEjcxlyPIEFqaIcGhgJN3-E8",
    authDomain: "ffxiv-submarin.firebaseapp.com",
    projectId: "ffxiv-submarin",
    storageBucket: "ffxiv-submarin.appspot.com",
    messagingSenderId: "858250318096",
    appId: "1:858250318096:web:88a50a8325f459ba901595",
    measurementId: "G-ME06WV8RSY"
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
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
  });

app.get("/getList", (req, res) => {
    var database   = firebase.database();
    database.ref('board').once('value')
    .then(function(snapshot) {
        var sJson = JSON.stringify(snapshot.val());
        var oJson = JSON.parse(sJson);

        var oKeys = Object.keys(oJson);

        var dataSet = [];
        oKeys.forEach(element => {
            let oData = oJson[element];
            dataSet.push([oData.brdtitle]);
        })
        res.writeHead(200, {'Content-Type':'application/json'});
        res.end(JSON.stringify(dataSet));
    })
});


app.get("/testInput", (req, res) => {
    var database   = firebase.database();
    var newPostKey = database.ref().child('posts').push().key;
    
    var postData = {
        brdno: newPostKey,
        brdwriter:"홍길동",
        brdtitle:"게시판 제목",
        brdmemo:"게시물 내용",
        brddate: Date.now()
    };
    
    var updates = {};
    updates['/board/' + newPostKey] = p
    ostData;
    
    
    database.ref().update(updates);

    res.end();
});


app.use("/public", express.static(path.join(__dirname, "public")));

const port = process.env.PORT || "3000";
app.set("port", port);

http.createServer(app).listen(port);
