const express = require("express");
const path = require("path");
const app = express();
require("dotenv").config();
const stripe = require("stripe")(process.env.SECRET_KEY);
const port = process.env.PORT ;
const cors=require("cors");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.set("view engine", "ejs");
app.set("views", path.resolve("views"));
app.get("/", (req, res) => {
    res.render("home");
});

app.post("/payment", async (req, res) => {
    try {
        const { product, amount, currency, quantity } = req.body;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: currency,
                        product_data: {
                            name: product,
                        },
                        unit_amount: parseInt(amount) * 100,
                    },
                    quantity: quantity,
                },
            ],
            mode: "payment",
            success_url: "http://localhost:3000/success",
            cancel_url: "http://localhost:3000/cancel",
        });

        res.redirect(303, session.url);
    } catch (err) {
        console.log(err);
        res.status(500).send("Payment processing failed");
    }
});
app.get("/success", (req, res) => {
    res.send("payment done successfuly");
});

app.get("/cancel", (req, res) => {
    res.redirect("home");
})

app.listen(port, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log(`Server is running on port ${port}`);
    }
});
