import mongoose, {Document, Schema, Types} from "mongoose";

export interface IMessage extends Document{
    chatId: Types.ObjectId;
    sender: Types.ObjectId;
    text: string;
    imageUrl?:{
        url: string;
        publicId: string;
    };
    messageType: 'text' | 'image';
    seen: boolean;
    seenAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}       
   
const messageSchema = new Schema<IMessage>({
    chatId: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },  
    text: { type: String },
    imageUrl: {
        url: { type: String }, 
        publicId: { type: String }
    },
    messageType: { type: String, enum: ['text', 'image'], required: true },
    seen: { type: Boolean, default: false },
    seenAt: { type: Date },
}, { timestamps: true });   

export const Message = mongoose.model<IMessage>('Message', messageSchema);