"use strict";
require("dotenv").config();
const { verify } = require("jsonwebtoken");
const { User } = require("../models");

const authentication = async function (req, res, next) {
  try {
    const { access_token } = req.headers;

    if (!access_token) {
      throw {
        name: "empty",
      };
    }

    const payloadData = verify(access_token, process.env.JWT_KEY);

    const user = await User.findByPk(payloadData);

    if (!user) {
      throw { name: "invalid" };
    }
    req.user = {
      id: user.id,
      username: user.username,
    };
    next();
  } catch (err) {
    console.log(err.name);
    if (err.name === "empty") {
      res.status(401).json({
        message: "Empty token",
      });
    } else if (err.name === "JsonWebTokenError") {
      res.status(401).json({
        message: "Invalid token",
      });
    }
  }
};

module.exports = authentication;
