import mongoose from "mongoose";

const { Schema, model } = mongoose;

const GuestSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        place: { type: String, required: true, trim: true },
        qrId: { type: String, required: true, unique: true, index: true },
        checkedIn: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default model("Guest", GuestSchema);


