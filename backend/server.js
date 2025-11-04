import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import guestsRouter from "./routes/guests.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

//CONNECT TO MONGODB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.log("Error connecting to MongoDB", err);
});

// API ROUTES
app.use("/api/guests", guestsRouter);

//SAMPLE TEST ROUTE
app.get("/test", (req, res) => {
    res.send("Hello World");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});