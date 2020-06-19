"use strict";
module.exports = function (app) {
  var actions = require("./contorller");

  app.route("/create").get(actions.create);

  app.route("/place").get(actions.place);

  app.route("/status").get(actions.status);
};
