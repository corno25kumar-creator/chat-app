import mongoose, { Document, Schema } from "mongoose";
const schema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
}, {
    timestamps: true, // ✅ plural: timestamps
});
// ✅ Capitalize model name and fix casing of schema reference
export const User = mongoose.model("User", schema);
//# sourceMappingURL=User.js.map