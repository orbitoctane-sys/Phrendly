const express = require("express");
const cors = require("cors");
const axios = require("axios");

const { consumerKey, consumerSecret } = require("./config");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// HOME PAGE

app.get("/", (req, res) => {

    res.sendFile(__dirname + "/index.html");

});

// GET PESAPAL TOKEN

app.get("/pesapal-token", async (req, res) => {

    try {
        const response = await axios.post(
            "https://pay.pesapal.com/v3/api/Auth/RequestToken",
            {
                consumer_key: consumerKey,
                consumer_secret: consumerSecret
            }
        );

        res.json(response.data);
    } catch (error) {
        console.log(
            error.response?.data ||
            error.message
        );

        res.status(500).json({
            error: "Failed to get token"
        });
    }

});
app.post("/create-order", async (req, res) => {

    try {

        // Get token
        const tokenResponse = await axios.post(
            "https://pay.pesapal.com/v3/api/Auth/RequestToken",
            {
                consumer_key: consumerKey,
                consumer_secret: consumerSecret
            }
        );

        const token = tokenResponse.data.token;

        // Create order
        const orderResponse = await axios.post(
            "https://pay.pesapal.com/v3/api/Transactions/SubmitOrderRequest",
            {
                id: "ORDER_" + Date.now(),
                currency: "KES",
                amount: 300,
                description: "Phrendly Account Activation",
                callback_url: "https://phrendly.com/success",
                notification_id: "PASTE_YOUR_IPN_ID_HERE",
                billing_address: {
                    email_address: "customer@example.com",
                    phone_number: req.body.phone,
                    country_code: "KE",
                    first_name: "Phrendly",
                    last_name: "User"
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        res.json(orderResponse.data);

    } catch (error) {

        console.log(error.response?.data || error.message);

        res.status(500).json({
    error:
    error.response?.data ||
    error.message
});

    }

});
app.get("/ipn-list", async (req, res) => {

try {

    const tokenResponse = await axios.post(
        "https://pay.pesapal.com/v3/api/Auth/RequestToken",
        {
            consumer_key: consumerKey,
            consumer_secret: consumerSecret
        }
    );

    const token = tokenResponse.data.token;

    const response = await axios.get(
        "https://pay.pesapal.com/v3/api/URLSetup/GetIpnList",
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    res.json(response.data);

} catch (error) {

    console.log(error.response?.data || error.message);

    res.status(500).json({
        error: "Failed to get IPN list"
    });

}

});

const port = process.env.PORT || 3000;
app.listen(port, () => {

    console.log(`Server running on http://localhost:${port}`);

});