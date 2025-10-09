import mongoose, {Document, Schema} from "mongoose";

export interface IChat extends Document {
    users:string[];
    latestMessages: {
        text: string,
        timestamp: Date
    };
    createdAt: Date;
    updatedAt: Date;
}

const schema: Schema<IChat> = new Schema({
    users: {type: [String], required: true},
    latestMessages: {
        text: {type: String,},
        timestamp: {type: Date, }
    },
},
    {
        timestamps: true
    }
);
export const Chat = mongoose.model<IChat>('Chat', schema);

