const { stkPush } = require("./utils/mpesa");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const connectDB = require("./database/database");
const { initializeDatabase, findUserByEmail, saveUser, updateUserPassword, activateUser } = require("./models/User");

const app = express();

(async () => {
    await connectDB();
    await initializeDatabase();
    console.log("Database connected and initialized");
})().catch((error) => {
    console.error("Database initialization error:", error.message);
});

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.post("/api/register", async (req, res) => {
    try {
        const { username, email, password, referralCode: submittedReferralCode } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const generatedReferralCode = Math.random().toString(36).substring(2, 10).toUpperCase();

        const user = await saveUser({
            username,
            email,
            password: hashedPassword,
            referralCode: generatedReferralCode,
            referredBy: submittedReferralCode || null
        });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "secret", {
            expiresIn: "7d"
        });

        res.status(201).json({
            message: "Account created successfully",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                referralCode: user.referralCode
            }
        });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ message: "Registration failed" });
    }
});

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "secret", {
            expiresIn: "7d"
        });

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                referralCode: user.referralCode
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Login failed" });
    }
});

app.post("/api/forgot-password", async (req, res) => {
    try {
        const { email, newPassword, confirmNewPassword } = req.body;

        if (!email || !newPassword || !confirmNewPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: "Email not found" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updated = await updateUserPassword(email, hashedPassword);

        if (!updated) {
            return res.status(500).json({ message: "Password reset failed" });
        }

        res.json({
            message: "Password reset successful",
            user: {
                id: user.id,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ message: "Password reset failed" });
    }
});

// HOME PAGE

app.get("/", (req, res) => {

    res.sendFile(__dirname + "/index.html");

});

// DASHBOARD PAGE

app.get("/dashboard", async (req, res) => {
    const token = req.headers.authorization?.replace("Bearer ", "") || req.query.token;

    if (!token) {
        return res.redirect("/login.html");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
        const user = await findUserByEmail(decoded.email || "");

        if (!user || !user.isActive) {
            return res.redirect("/payment.html");
        }

        return res.sendFile(__dirname + "/public/dashboard.html");
    } catch (error) {
        return res.redirect("/login.html");
    }
});

// LOGIN PAGE

app.get("/login.html", (req, res) => {

    res.sendFile(__dirname + "/login.html");

});

// PAYMENT SUCCESS

app.get("/payment-success", (req, res) => {

    res.sendFile(__dirname + "/public/dashboard.html");

});

// M-PESA PAYMENT ROUTES

async function handleMpesaPayment(req, res) {
    try {
        const phone = req.body.phonenumber || req.body.phone || req.body.PhoneNumber;
        const amount = Number(req.body.amount || 300);
        const email = req.body.email || req.headers['x-user-email'];

        if (!phone) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required"
            });
        }

        if (!process.env.MPESA_CONSUMER_KEY || !process.env.MPESA_CONSUMER_SECRET || !process.env.MPESA_SHORTCODE || !process.env.MPESA_PASSKEY || !process.env.MPESA_CALLBACK_URL) {
            return res.status(500).json({
                success: false,
                message: "M-Pesa credentials are not configured on the server"
            });
        }

        const result = await stkPush(phone, amount);

        console.log("STK RESPONSE:", result);

        if (email) {
            const user = await findUserByEmail(email);
            if (user) {
                await activateUser(email, result.MerchantRequestID || "", amount);
            }
        }

        return res.json({
            success: true,
            message: "STK Push sent",
            data: result
        });
    } catch (error) {
        const mpesaError = error.response?.data;
        let message = "Payment request failed";

        if (typeof mpesaError === "string") {
            message = mpesaError;
        } else if (mpesaError?.errorMessage) {
            message = mpesaError.errorMessage;
        } else if (mpesaError?.message) {
            message = mpesaError.message;
        } else if (error.message) {
            message = error.message;
        }

        if (message.includes("Invalid PhoneNumber") || mpesaError?.errorCode === "400.002.02") {
            message = "Invalid phone number. Use a registered Safaricom M-Pesa test number.";
        }

        console.error("STK Push Error:", mpesaError || error.message);

        return res.status(500).json({
            success: false,
            message
        });
    }
}

app.post("/api/mpesa/initiate-payment", handleMpesaPayment);
app.post("/create-order", handleMpesaPayment);

app.post("/api/mpesa/initiate", (req, res) => {
    const { phoneNumber, amount } = req.body;

    res.json({
        message: "M-Pesa payment request received",
        phoneNumber: phoneNumber || null,
        amount: amount || 300,
        status: "pending"
    });
});

app.post("/api/mpesa/callback", async (req, res) => {
    try {
        const { Body } = req.body || {};
        const stkCallback = Body?.stkCallback || {};
        const resultCode = stkCallback.ResultCode;
        const resultDesc = stkCallback.ResultDesc;
        const metadata = stkCallback.CallbackMetadata?.Item || [];

        const phoneItem = metadata.find((item) => item.Name === "PhoneNumber");
        const amountItem = metadata.find((item) => item.Name === "Amount");
        const receiptItem = metadata.find((item) => item.Name === "MpesaReceiptNumber");

        const phoneNumber = phoneItem?.Value;
        const amount = amountItem?.Value;
        const receiptNumber = receiptItem?.Value;

        if (resultCode === 0 && phoneNumber) {
            const normalizedPhone = String(phoneNumber).replace(/\D/g, "");
            const email = `${normalizedPhone}@mpesa.local`;
            const user = await findUserByEmail(email);

            if (user) {
                await activateUser(email, receiptNumber, amount);
            }
        }

        res.json({
            message: "M-Pesa callback received",
            status: "received"
        });
    } catch (error) {
        console.error("Callback error:", error.message);
        res.status(500).json({ message: "Callback failed" });
    }
});

app.get("/api/mpesa/status", (req, res) => {
    res.json({
        status: "ready",
        gateway: "mpesa"
    });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});