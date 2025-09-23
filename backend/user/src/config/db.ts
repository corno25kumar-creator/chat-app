import mongoose from "mongoose";

const connectDb = async () => {
    const url = process.env.MONGO_URL;

    if(!url){
        throw new Error ("MONGO_URL IS NOT DEFINED IN ENVIRONMENT");

    }

    try {
        await mongoose.connect(url,{
            dbName: "chatApp"
        });
        console.log("connected to mongo db")
        
    } catch (error) {
        console.error("failed to connect to mongo db ", error);
        process.exit(1);
    }
}

export default connectDb;