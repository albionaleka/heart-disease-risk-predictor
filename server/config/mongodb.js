import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => {
            console.log("MongoDB connected");
        });
        mongoose.connection.on("error", (err) => {
            console.log("MongoDB connection error: ", err);
        });

        const mongoURI = process.env.MONGODB_URI;
        await mongoose.connect(mongoURI, {
            dbName: "Auth"
        });
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
}

export default connectDB;