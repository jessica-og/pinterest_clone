import { Schema } from "mongoose";
import mongoose from "mongoose";

const boardSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdForPin: { type: mongoose.Schema.Types.ObjectId, ref: "Pin" },
  },
  { timestamps: true }
);

export default mongoose.model("Board", boardSchema);
