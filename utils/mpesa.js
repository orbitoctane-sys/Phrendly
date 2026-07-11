const axios = require("axios");
require("dotenv").config();


async function getAccessToken() {

    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

    const auth = Buffer
        .from(`${consumerKey}:${consumerSecret}`)
        .toString("base64");


    const response = await axios.get(
        "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
        {
            headers: {
                Authorization: `Basic ${auth}`
            }
        }
    );


    return response.data.access_token;

}



function normalizePhoneNumber(phoneNumber) {
    const cleaned = String(phoneNumber || "").replace(/\D/g, "");

    if (!cleaned) {
        return "";
    }

    if (cleaned.startsWith("254")) {
        return cleaned;
    }

    if (cleaned.startsWith("0")) {
        return `254${cleaned.slice(1)}`;
    }

    if (cleaned.startsWith("7")) {
        return `254${cleaned}`;
    }

    return cleaned;
}

function generatePassword() {

    const shortcode =
        process.env.MPESA_SHORTCODE;

    const passkey =
        process.env.MPESA_PASSKEY;


    const timestamp =
        new Date()
        .toISOString()
        .replace(/[-T:.Z]/g, "")
        .slice(0,14);


    const password =
        Buffer
        .from(
            shortcode + passkey + timestamp
        )
        .toString("base64");


    return {
        password,
        timestamp
    };

}



async function stkPush(phoneNumber, amount) {
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    if (!normalizedPhone || normalizedPhone.length < 12) {
        throw new Error("Phone number must be a valid Kenyan mobile number");
    }

    const token =
        await getAccessToken();


    const {
        password,
        timestamp
    } = generatePassword();


    const response =
    await axios.post(

        "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest",

        {

            BusinessShortCode:
            process.env.MPESA_SHORTCODE,


            Password:
            password,


            Timestamp:
            timestamp,


            TransactionType:
            "CustomerPayBillOnline",


            Amount:
            amount,


            PartyA:
            normalizedPhone,


            PartyB:
            process.env.MPESA_SHORTCODE,


            PhoneNumber:
            normalizedPhone,


            CallBackURL:
            process.env.MPESA_CALLBACK_URL,


            AccountReference:
            "Phrendly",


            TransactionDesc:
            "Account activation"

        },

        {

            headers: {

                Authorization:
                `Bearer ${token}`

            }

        }

    );


    return response.data;

}



module.exports = {
    getAccessToken,
    stkPush
};