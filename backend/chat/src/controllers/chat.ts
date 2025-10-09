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
            return {
                user: null,
                chat: {
                    ...chat.toObject(),
                    unSeenCount,
                    latestMessages: chat.latestMessages || null,
                }
            };
        }
    }));

    return res.json(chatWithUserData);
});



export const sendMessage = TryCatch(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;
    const { chatId, content } = req.body;
   // const imageFile = req.file;
});
