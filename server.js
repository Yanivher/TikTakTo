"use strict";
var express = require("express"),
  app = express(),
  port = process.env.PORT || 5000;

const session = require("express-session");
app.use(session({ secret: "ssshhhhh" }));

var routes = require("./routs");
routes(app);

app.listen(port);
console.log("Server started on port: " + port);
