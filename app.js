"use strict";
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT;
const {
  User,
  Country,
  Order,
  Log,
  HomeImage,
  AboutImage,
} = require("./models");
const jwt = require("jsonwebtoken");
const authentication = require("./middlewares/authentication");

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  try {
    res.status(200).json({
      message: "LSE Server is running",
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal server error",
      err,
    });
  }
});

// Authentication not required

//USER LOGIC

app.post("/user", async (req, res) => {
  try {
    const { username, password, secret } = req.body;

    if (!username || !password) {
      throw {
        message: "empty",
      };
    }

    if (secret) {
      if (secret !== process.env.AUTH_SECRET) {
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
    if (err.message === "no user") {
      res.status(400).json({
        message: "user not found",
      });
    }
  }
});

app.post("/login", async (req, res) => {
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
      const token = jwt.sign(user.id, process.env.JWT_KEY);
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
        err,
      });
    }
  }
});

//COUNTRY LOGIC

app.get("/country", async (req, res) => {
  try {
    const request = await Country.findAll({
      order: [["name", "ASC"]],
    });

    res.status(200).json(request);
  } catch (err) {}
});

app.get("/homeimage", async (req, res) => {
  try {
    const images = await HomeImage.findAll({
      order: [["id", "ASC"]],
    });

    res.status(200).json(images);
  } catch (err) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

app.get("/aboutimage", async (req, res) => {
  try {
    const data = await AboutImage.findAll({
      order: [["id", "ASC"]],
    });
    console.log(data);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({
      message: "Internal server error",
      err,
    });
  }
});

app.get("/track/:resi", async (req, res) => {
  try {
    const { resi } = req.params;
    if (!resi) {
      throw {
        name: "empty",
      };
    }
    const request = await Order.findOne({
      where: { resi: resi },
      include: Log,
    });

    if (!request) {
      throw {
        name: "not found",
      };
    }
    res.status(200).json(request);
  } catch (err) {
    if (err.name === "empty") {
      res.status(400).json({
        message: "Empty resi",
      });
    } else if (err.name === "not found") {
      res.status(404).json({
        message: "Order not found",
      });
    }
  }
});

app.get("/order/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const data = await Order.findOne({
      where: { id: id },
      include: [{ model: User, attributes: { exclude: ["password"] } }, Log],
      order: [[Log, "id", "ASC"]],
    });

    if (!data) {
      throw {
        name: "not found",
      };
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(404).json({
      message: "Order not found",
    });
  }
});

app.use(authentication);

// Authentication Required

//ORDER LOGIC

app.get("/order", async (req, res) => {
  try {
    const request = await Order.findAll({ order: [["createdAt", "DESC"]] });

    res.status(200).json(request);
  } catch (err) {}
});

app.post("/order", async (req, res) => {
  try {
    const UserId = req.user.id;
    const {
      resi,
      sender,
      senderContact,
      recipient,
      recipientAddress,
      recipientContact,
      recipientCountry,
      cityOrigin,
    } = req.body;

    let name = "";

    if (!resi) {
      name = "resi";
    } else if (!sender) {
      name = "sender";
    } else if (!senderContact) {
      name = "senderContact";
    } else if (!recipient) {
      name = "recipient";
    } else if (!recipientAddress) {
      name = "recipientAddress";
    } else if (!recipientContact) {
      name = "recipientContact";
    } else if (!recipientCountry) {
      name = "recipientCountry";
    } else if (!cityOrigin) {
      name = "cityOrigin";
    }

    if (name) {
      throw {
        name: "empty",
        value: name,
      };
    }

    const request = await Order.create({
      resi,
      sender,
      senderContact,
      recipient,
      recipientAddress,
      recipientContact,
      status: "Ongoing",
      UserId,
      recipientCountry,
      cityOrigin,
    });

    res.status(201).json({
      message: "Order created",
    });
  } catch (err) {
    if (err.name === "empty") {
      res.status(400).json({
        message: `empty ${err.value}`,
      });
    }
  }
});

app.put("/order/:id", async (req, res) => {
  try {
    const { username } = req.user;
    const { id } = req.params;
    const {
      resi,
      sender,
      senderContact,
      recipient,
      recipientAddress,
      recipientContact,
      cityOrigin,
      recipientCountry,
    } = req.body;

    const exist = await Order.findByPk(id);

    if (!exist) {
      throw {
        name: "not exist",
      };
    }

    let name = "";

    if (!resi) {
      name = "resi";
    } else if (!sender) {
      name = "sender";
    } else if (!senderContact) {
      name = "senderContact";
    } else if (!recipient) {
      name = "recipient";
    } else if (!recipientAddress) {
      name = "recipientAddress";
    } else if (!recipientContact) {
      name = "recipientContact";
    } else if (!recipientCountry) {
      name = "country";
    }

    if (name) {
      throw {
        name: "empty",
        value: name,
      };
    }

    const request = await Order.update(
      {
        resi,
        sender,
        senderContact,
        recipient,
        recipientAddress,
        recipientContact,
        updatedBy: username,
        cityOrigin,
        recipientCountry,
      },
      {
        where: { id },
      }
    );

    res.status(200).json({
      message: "Order updated",
    });
  } catch (err) {
    if (err.name === "empty") {
      res.status(400).json({
        message: `empty ${err.value}`,
      });
    } else if (err.name === "not exist") {
      res.status(404).json({
        message: "Order not found",
      });
    } else {
      res.status(500).json({
        message: "Internal server error",
      });
    }
  }
});

app.patch("/order/:id", async (req, res) => {
  try {
    const OrderId = req.params.id;
    const UserId = req.user.id;
    const { username } = req.user;
    const { recievedBy } = req.body;

    if (!recievedBy) {
      throw {
        name: "empty",
      };
    }

    const exist = await Order.findByPk(OrderId);

    if (!exist) {
      throw {
        name: "not exist",
      };
    }

    const request = await Order.update(
      {
        recievedBy,
        status: "Finished",
        updatedBy: username,
      },
      {
        where: {
          id: OrderId,
        },
      }
    );

    res.status(200).json({
      message: `${exist.resi} status now finished`,
    });
  } catch (err) {
    if (err.name === "empty") {
      res.status(400).json({
        message: "Empty receiver name",
      });
    } else if (err.name === "not exist") {
      res.status(404).json({
        message: "Order not found",
      });
    } else {
      res.status(500).json({
        message: "Internal server error",
      });
    }
  }
});

//LOG LOGIC

app.post("/log", async (req, res) => {
  try {
    const { OrderId, description, date } = req.body;
    const UserId = req.user.id;

    const exist = await Order.findByPk(OrderId);

    if (!exist) {
      throw {
        name: "exist",
      };
    }

    if (!OrderId) {
      throw {
        name: "order",
      };
    } else if (!description) {
      throw {
        name: "desc",
      };
    } else if (!date) {
      throw {
        name: "date",
      };
    }

    const request = await Log.create({
      description,
      UserId,
      OrderId,
      date,
    });

    res.status(200).json({
      message: "Order updated",
    });
  } catch (err) {
    if (err.name === "order") {
      res.status(400).json({
        message: "Empty order id",
      });
    } else if (err.name === "desc") {
      res.status(400).json({
        message: "Empty description",
      });
    } else if (err.name === "date") {
      res.status(404).json({
        message: "Empty date",
      });
    } else if (err.name === "exist") {
      res.status(404).json({
        message: "Order not found",
      });
    }
  }
});

app.put("/log/:id", async (req, res) => {
  try {
    const { description, date } = req.body;
    const { id } = req.params;

    if (!description) {
      throw {
        name: "empty",
      };
    } else if (!date) {
      throw {
        name: "empty",
      };
    }

    const exist = await Log.findByPk(id);

    if (!exist) {
      throw {
        name: "exist",
      };
    }

    const request = await Log.update(
      {
        description,
        date,
      },
      { where: { id } }
    );

    res.status(200).json({
      message: "Log updated",
    });
  } catch (err) {
    if (err.name === "exist") {
      res.status(404).json({
        message: "Log not found",
      });
    } else if (err.name === "empty") {
      res.status(400).json({
        message: "Empty description",
      });
    } else if (err.name === "date") {
      res.status(400).json({
        message: "Empty date",
      });
    }
  }
});

//COUNTRY LOGIC

app.post("/country", async (req, res) => {
  try {
    const { name, price1, price2, price3, price4, price5 } = req.body;

    if (!name || !price1 || !price2 || !price3 || !price4 || !price5) {
      throw {
        message: "empty",
      };
    }

    const request = await Country.create({
      name,
      price1,
      price2,
      price3,
      price4,
      price5,
    });

    res.status(201).json({
      message: "Country created",
    });
  } catch (err) {
    if (err.message === "empty") {
      res.status(400).json({
        message: "Empty country name/price",
      });
    }
  }
});

app.delete("/country/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const country = await Country.findByPk(id);

    if (!country) {
      throw {
        message: "not found",
      };
    }

    const request = await Country.destroy({
      where: { id },
    });

    res.status(200).json({
      message: "Country deleted",
    });
  } catch (err) {
    console.log(err);
    if (err.message === "not found") {
      res.status(404).json({
        message: "Country not found",
      });
    } else {
      res.status(500).json({
        message: "Internal server error",
        error: err,
      });
    }
  }
});

app.put("/country/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price1, price2, price3, price4, price5 } = req.body;
    if (!name || !price1 || !price2 || !price3 || !price4 || !price5) {
      throw {
        message: "empty",
      };
    }

    const country = await Country.findByPk(id);

    if (!country) {
      throw {
        message: "not found",
      };
    }

    const request = await Country.update(
      {
        name,
        price1,
        price2,
        price3,
        price4,
        price5,
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

//IMAGES LOGIC

app.post("/homeimage", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      throw {
        name: "empty",
      };
    }

    const images = await HomeImage.findAll();

    if (images.length === 5) {
      throw {
        name: "limit",
      };
    }

    const request = await HomeImage.create({
      url,
    });

    res.status(201).json({
      message: "Image added",
    });
  } catch (err) {
    if (err.name === "empty") {
      res.status(400).json({
        message: "Empty url",
      });
    }
    if (err.name === "limit") {
      res.status(403).json({
        message: "Maximum 5 image",
      });
    }
  }
});

app.patch("/homeimage/:id", async (req, res) => {
  try {
    const { url } = req.body;
    const { id } = req.params;

    if (!url) {
      throw {
        name: "empty",
      };
    }

    const exist = await HomeImage.findByPk(id);

    if (!exist) {
      throw {
        name: "exist",
      };
    }

    const request = await HomeImage.update(
      {
        url,
      },
      {
        where: {
          id,
        },
      }
    );

    res.status(200).json({
      message: "Image updated",
    });
  } catch (err) {
    if (err.name === "empty") {
      res.status(400).json({
        message: "Empty url",
      });
    } else if (err.name === "exist") {
      res.status(404).json({
        message: "Image not exist",
      });
    }
  }
});

app.delete("/homeimage/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const exist = await HomeImage.findByPk(id);

    if (!exist) {
      throw {
        name: "exist",
      };
    }

    const request = await HomeImage.destroy({
      where: {
        id,
      },
    });

    res.status(200).json({
      message: "Image deleted",
    });
  } catch (err) {
    if (err.name === "exist") {
      res.status(404).json({
        message: "Image not exist",
      });
    }
  }
});

app.post("/aboutimage", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      throw {
        name: "empty",
      };
    }

    const images = await AboutImage.findAll();

    if (images.length === 8) {
      throw {
        name: "limit",
      };
    }

    const request = await AboutImage.create({
      url,
    });

    res.status(201).json({
      message: "Image added",
    });
  } catch (err) {
    if (err.name === "empty") {
      res.status(400).json({
        message: "Empty url",
      });
    }
    if (err.name === "limit") {
      res.status(403).json({
        message: "Maximum 5 image",
      });
    }
  }
});

app.patch("/aboutimage/:id", async (req, res) => {
  try {
    const { url } = req.body;
    const { id } = req.params;

    if (!url) {
      throw {
        name: "empty",
      };
    }

    const exist = await AboutImage.findByPk(id);

    if (!exist) {
      throw {
        name: "exist",
      };
    }

    const request = await AboutImage.update(
      {
        url,
      },
      {
        where: {
          id,
        },
      }
    );

    res.status(200).json({
      message: "Image updated",
    });
  } catch (err) {
    if (err.name === "empty") {
      res.status(400).json({
        message: "Empty url",
      });
    } else if (err.name === "exist") {
      res.status(404).json({
        message: "Image not exist",
      });
    }
  }
});

app.delete("/aboutimage/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const exist = await AboutImage.findByPk(id);

    if (!exist) {
      throw {
        name: "exist",
      };
    }

    const request = await AboutImage.destroy({
      where: {
        id,
      },
    });

    res.status(200).json({
      message: "Image deleted",
    });
  } catch (err) {
    if (err.name === "exist") {
      res.status(404).json({
        message: "Image not exist",
      });
    }
  }
});

app.listen(port, () => {
  console.log(`Server app running on port ${port}`);
});
