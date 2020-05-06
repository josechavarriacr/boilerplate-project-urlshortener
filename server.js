"use strict";

var express = require("express");
var mongo = require("mongodb");
var mongoose = require("mongoose");

var cors = require("cors");

var app = express();

// Basic Configuration
var port = process.env.PORT || 3000;

// -> this project needs a db !! ??
var url = 'mongodb+srv://mercaditoUser:8fyETnGwivC1RQTb@cluster0-wxxtk.mongodb.net/mercaditocrdb?retryWrites=true&w=majority'
mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


// Create link schema and include a pre-save which auto increments the count and assigns it to the link _id
const linkSchema = new mongoose.Schema({
  _id: { type: String },
  link: "",
  created_at: ""
});

const Link = mongoose.model("Link", linkSchema);

app.use(cors());

// -> this project needs to parse POST bodies !! ??
// you should mount the body-parser here
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// your first API endpoint...
app.get("/api/hello", function(req, res) {
  res.json({ greeting: "hello API" });
});

// -> Functionality ??
app.post("/api/shorturl/new", (req, res) => {
  // Check getting data & assign to variable
  let data = req.body.url;
  // console.log(data);
  let urlRegex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;


  // Check if data is a valid URL ?? - if not: res.json error object
  console.log(urlRegex.test(data));
  
  if (!urlRegex.test(data)) {
    res.json({ error: "invalid URL" });
  } else {
    Link.findOne({ link: data }, (err, doc) => {
      if (doc) {
        console.log("link found in db");
        res.json({
          original_url: data,
          short_url: doc._id
        });
      } else {
        console.log("link NOT found in db, adding new link");
        let id = makeid();
        //Link.findOne({ _id: id }, (err, doc) => {
          //if(err) {
          let link = new Link({
            _id: id,
            link: data,
            created_at: new Date()
          });
        
        // console.log(link);
          
          link.save(err, doc => {
            if (err) return console.error("Error: ", err);
            console.log(doc);
            res.json({
              original_url: data,
              short_url: link._id
            });
          });
      }
    });
  }
});

app.get("/:id", (req, res) => {
  let id = req.params.id;
  Link.findOne({ _id: id }, (err, doc) => {
    if (doc) {
      res.redirect(doc.link);
    } else {
      res.redirect("/");
    }
  });
});

app.get("/api/shorturl/new", (req, res) => {
  res.json({ hello: "hi there..." });
});

app.listen(port, function() {
  console.log("Node.js listening ...");
});

// Function for random id ->
function makeid() {
  //makes a random shortened ID
  let randomText = "";
  //make alphanumeric
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 5; i++) {
    randomText += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return randomText;
}
