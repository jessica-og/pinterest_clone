import { Schema } from "mongoose";
import mongoose from "mongoose";
import Save from "./save.model.js"; 
import Board from "./board.model.js";

const pinSchema = new Schema(
  {
    media: {
      type: String,  
      required: true,
    },
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    link: {
      type: String,
    },
    board: {
      type: Schema.Types.ObjectId,
      ref: "Board",
    },
    tags: {
      type: [String],
    }, 
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imageKitFileId: {
      type: String,
      required: false,
    },
    
  },
  { timestamps: true }
);
pinSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Save.deleteMany({ pin: doc._id });
  }
  if (doc) {
    await Board.deleteMany({ pin: doc._id });
  }
});

export default mongoose.model("Pin", pinSchema);
