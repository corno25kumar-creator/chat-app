import mongoose from 'mongoose';

const connectDb = async()=>{
    const url = process.env.MONGO_URI

    if(!url){
        throw new Error("MongoDB connection URL is not defined in environment variables");
    }

    try {
        await mongoose.connect(url,(
            {
                dbName: 'chat_app',
            }
        ));
        console.log("connected to mongodb")
        
    } catch (error) {
        console.error('failed to conect to mongodb', error);
        process.exit(1);
    }
}

export default connectDb;