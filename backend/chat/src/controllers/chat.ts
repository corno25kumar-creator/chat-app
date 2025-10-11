import axios from "axios";
import TryCatch from "../config/TryCatch.js";
import type { AuthenticatedRequest } from "../middlewares/isAuth.js";
import { Chat } from "../models/Chat.js";
import { Message } from "../models/Messages.js";



// Create a new chat between two users
export const createNewChat = TryCatch(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;
    const { otherUserId } = req.body;

    
    if (!otherUserId) {
        return res.status(400).json({ message: 'Other user ID is required' });
    }

    const existingChat = await Chat.findOne({
        users: { $all: [userId, otherUserId], $size: 2 }
    });

    if (existingChat) {
        return res.json({ message: 'Chat already exists', chat_Id: existingChat._id });
    }

    const newChat = await Chat.create({
        users: [userId as string, otherUserId],
    });

    return res.status(201).json({ message: 'Chat created', chat_Id: newChat._id });
});

// Get all chats for the authenticated user
export const getAllChats = TryCatch(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;

    if (!userId) {
        return res.status(400).json({ message: 'User ID is missing' });
    }

    const chats = await Chat.find({
        users: { $in: [userId] }
    }).sort({ updatedAt: -1 });

    const chatWithUserData = await Promise.all(chats.map(async (chat) => {
        const otherUserId = chat.users.find((id) => id.toString() !== userId.toString());

        const unSeenCount = await Message.countDocuments({
            chatId: chat._id,
            seen: false,
            sender: { $ne: userId }
        });

        try {
            const { data } = await axios.get(`${process.env.USER_SERVICE_URL}/api/v1/user/${otherUserId}`);
            return {
                user: data,
                chat: {
                    ...chat.toObject(),
                    unSeenCount,
                    latestMessages: chat.latestMessages || null,
                }
            };
        } catch (error) {
            console.log(error)
            return {
                user: {_id:otherUserId, name:"Unknown User"},
                chat: {
                    ...chat.toObject(),
                    unSeenCount,
                    latestMessages: chat.latestMessages || null,
                }
            };
        }
    }));

    res.json({
        chats:chatWithUserData
    });
});



export const sendMessage = TryCatch(async (req: AuthenticatedRequest, res) => {
    const senderId = req.user?._id;
    const { chatId, text } = req.body;
    const imageFile = req.file;

    
    if (!senderId) {
     
        return res.status(400).json({ message: 'Sender ID is missing' });
    } 
    if (!chatId) {
            return res.status(400).json({ message: 'Chat ID is required' });
    }
    if(!text && !imageFile){
        return res.status(400).json({ message: 'Message content or image is required' });
    }
    
    const chat = await Chat.findById(chatId);

    if(!chat){
        return res.status(404).json({ message: 'Chat not found' });
    }
    

    const isUserInChat = chat.users.some((userId) => {
        userId.toString() === senderId.toString()       
    });

    if(!isUserInChat){
        res.status(403).json({ message: 'You are not a participant of this chat' });
        return
    }

    const otheruserId = chat.users.find((id) => id.toString() !== senderId.toString());

     if (!otheruserId) {
     
        return res.status(400).json({ message: 'no other user ID ' });
    } 

    // socket setup 

    let messageData : any = {
        chatId:chatId,
        sender: senderId,
        seen: false,
        seenAt: undefined
    }

    if(imageFile){
        messageData.image = {
            url:imageFile.filename,
            publicId: imageFile.filename
        }
        messageData.text = text || "";
        messageData.messageType = 'image';
    }else{
        messageData.text = text;
        messageData.messageType = "text"
    }
    const message = new Message(messageData)

    const savedMessage = await message.save();

    const latestMessageText = imageFile? "📷 Image": text

const updatedChat = await Chat.findByIdAndUpdate(
  chatId,
  {
    latestMessages: {
      text: latestMessageText,
      sender: senderId,
    },
    updatedAt: new Date(),
  },
  { new: true }
);
 // emit to socket
 
res.status(201).json({
  message: "Chat updated successfully",
  chat: updatedChat,
  sender: senderId,
});
});
