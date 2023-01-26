"use strict";

const express = require("express");
const app = express();
const port = 5000;
const { User, Country } = require("./models");
const jwt = require("jsonwebtoken");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  try {
    res.status(200).json({
      message: "Server is running",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

app.post("/user", async (req, res) => {
  try {
    console.log(req.body);

    const { username, password, secret } = req.body;

    if (!username || !password) {
      throw {
        message: "empty",
      };
    }

    if (secret) {
      if (secret !== "12345") {
        throw {
          message: "incorrect secret",
        };
      }
      const request = await User.create({
        username,
        password,
        status: "active",
        role: "super",
      });
      res.status(200).json(request);
    } else {
      const request = await User.create({
        username,
        password,
        status: "active",
        role: "regular",
      });
      res.status(200).json(request);
    }
  } catch (err) {
    console.log(err);

    if (err.message === "empty") {
      res.status(400).json({
        message: "Empty username/password",
      });
    } else if (err.message === "incorrect secret") {
      res.status(401).json({
        message: "Unauthorized request",
      });
    } else {
      res.status(500).json({
        message: "Internal server error",
      });
    }
  }
});

app.patch("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      throw {
        message: "no user",
      };
    }

    console.log(user.status);

    if (user.status === "active") {
      const request = await User.update(
        {
          status: "inactive",
        },
        {
          where: {
            id,
          },
        }
      );

      if (request == 1) {
        res.status(200).json({
          message: `User ${id} now inactive`,
        });
      }
    } else {
      const request = await User.update(
        {
          status: "active",
        },
        {
          where: {
            id,
          },
        }
      );

      if (request == 1) {
        res.status(200).json({
          message: `User ${id} now active`,
        });
      }
    }
  } catch (err) {
    console.log(err);
    if (err.message === "no user") {
      res.status(400).json({
        message: "user not found",
      });
    }
  }
});

app.post("/login", async (req, res) => {
  console.log(req.body);
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw { message: "empty field" };
    }

    const user = await User.findOne({
      where: {
        username: username,
      },
    });

    if (!user || user.password !== password) {
      throw { message: "wrong credential" };
    } else {
      const token = jwt.sign(user.id, "SECRET");
      res.status(200).json({
        access_token: token,
      });
    }
  } catch (err) {
    console.log(err);
    if (err.message === "empty field") {
      res.status(400).json({
        message: "Empty username/password",
      });
    } else if (err.message === "wrong credential") {
      res.status(401).json({
        message: "Wrong username/password",
      });
    } else {
      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
});

app.get("/country", async (req, res) => {
  try {
    const request = await Country.findAll();

    console.log(request);

    res.status(200).json(request);
  } catch (err) {
    console.log(err);
  }
});

app.post("/country", async (req, res) => {
  try {
    const { name, price } = req.body;

    console.log(name, price);

    if (!name || !price) {
      throw {
        message: "empty",
      };
    }

    const request = await Country.create({
      name,
      price,
    });

    console.log(request);

    res.status(201).json({
      message: "Country created",
    });
  } catch (err) {
    console.log(err);
    if (err.message === "empty") {
      res.status(400).json({
        message: "Empty country name/price",
      });
    }
  }
});

app.delete("/country/:id", async (req, res) => {
  try {
    const country = await Country.findByPk(id);

    if (!country) {
      throw {
        message: "not found",
      };
    }
  } catch (err) {
    if (err.message === "not found") {
      res.status(404).json({
        message: "Country not found",
      });
    }
  }
});

app.put("/country/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price } = req.body;

    if (!name || !price) {
      throw {
        message: "empty",
      };
    }

    const country = await Country.findByPk(id);

    console.log(country);

    if (!country) {
      throw {
        message: "not found",
      };
    }

    const request = await Country.update(
      {
        name,
        price,
      },
      {
        where: {
          id,
        },
      }
    );

    res.status(200).json({
      message: "Country updated",
    });
  } catch (err) {
    console.log(err);

    if (err.message === "empty") {
      res.status(400).json({
        message: "Empty country name/price",
      });
    } else if (err.message === "not found") {
      res.status(404).json({
        message: "Country not found",
      });
    } else {
      message: "Internal server error";
    }
  }
});

app.listen(port, () => {
  console.log(`Server app running on port ${port}`);
});
