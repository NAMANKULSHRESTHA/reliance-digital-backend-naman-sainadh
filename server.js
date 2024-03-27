const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Products = require("./Products");
const Users = require("./Users");
const Orders = require("./Orders");
const stripe = require("stripe")(
  "sk_test_51KUDBXSE1AGsrDtwPrEyIlUO6MdKE5YUC77sdqUjLmrwjiEXxcGQPtkEDYlKmlaT6Ll0IIfMtBxaRYoWTEfdXYAh00tng8EKHY"
);
const connect = mongoose.connect("mongodb+srv://namankulshrestha2022:Naman%402004@cluster0.mreek.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
const app = express();
const port = process.env.PORT || 8000;

// Middlewares
app.use(express.json());
app.use(cors());

// connection url
connect.then(() => {
    console.log("Database connected");
})
.catch(() => {
    console.log("database not connected");
})


app.get("/", (req, res) => res.status(200).send("Home Page"));

// add product

app.post("/products/add", async (req, res) => {
    const productDetail = req.body;

    console.log("Product Detail >>>>", productDetail);

    const userdata=await Products.insertMany(productDetail);
    console.log(userdata);
});

app.get("/products/get", async (req, res) => {
    
    Products.find()
    .then((result) =>{
        res.status(200).json(result);
    })
    .catch((error) =>{
        res.status(500).json(error)
    })
});

// API for SIGNUP

app.post("/auth/signup", async (req, res) => {
  const { email, password, fullName } = req.body;

  const encrypt_password = await bcrypt.hash(password, 10);

  const userDetail = {
    email: email,
    password: encrypt_password,
    fullName: fullName,
  };

  const user_exist = await Users.findOne({ email: email });

  if (user_exist) {
    res.send({ message: "The Email is already in use !" });
  } else {
    const userdata1=await Users.insertMany(userDetail);
    console.log(userdata1);
    res.send({message:"User created Succesfully."});
  }
    });

// API for LOGIN

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const userDetail = await Users.findOne({ email: email });

  if (userDetail) {
    if (await bcrypt.compare(password, userDetail.password)) {
      res.send(userDetail);
    } else {
      res.send({ error: "invaild Password" });
    }
  } else {
    res.send({ error: "user is not exist" });
  }
});

// API for PAYMENT

app.post("/payment/create", async (req, res) => {
  const total = req.body.amount;
  console.log("Payment Request recieved for this ruppess", total);

  const payment = await stripe.paymentIntents.create({
    amount: total * 100,
    currency: "inr",
  });

  res.status(201).send({
    clientSecret: payment.client_secret,
  });
});

// API TO add ORDER DETAILS

app.post("/orders/add", async (req, res) => {
  const products = req.body.basket;
  const price = req.body.price;
  const email = req.body.email;
  const address = req.body.address;

  const orderDetail = {
    products: products,
    price: price,
    address: address,
    email: email,
  };
  const orderdata2=await Orders.insertMany(orderDetail);
  console.log(orderdata2);
  res.send({message:"Order Placed Succesfully."});
  
});

app.post("/orders/get", (req, res) => {
  const email = req.body.email;

  Orders.find()
  .then((result) => {
    res.status(200).json(result);
  })
  .catch((error) => {
    res.status(500).json(error)
  })
});

app.listen(port, () => console.log("listening on the port", port));


