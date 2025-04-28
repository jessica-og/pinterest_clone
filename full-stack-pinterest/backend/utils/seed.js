import dotenv from "dotenv";
dotenv.config();
import User from "../models/user.model.js";
import Pin from "../models/pin.model.js";
import Board from "../models/board.model.js";
import Comment from "../models/comment.model.js";
import bcrypt from "bcryptjs";
import connectDB from "./connectDB.js";

connectDB();

// Utility to shuffle an array
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

const seedDB = async () => {
  await User.deleteMany({});
  await Pin.deleteMany({});
  await Board.deleteMany({});
  await Comment.deleteMany({});

  const imageKitPins = [
    "pin1.jpeg", "pin2.jpeg", "pin3.jpeg", "pin4.jpeg", "pin5.jpeg",
    "pin6.jpeg", "pin7.jpeg", "pin8.jpeg", "pin9.jpeg", "pin10.jpeg",
    "pin11.jpeg", "pin12.jpeg", "pin13.jpeg", "pin14.jpeg", "pin15.jpeg",
    "pin16.jpeg", "pin17.jpeg", "pin18.jpeg", "pin19.jpeg", "pin20.jpeg",
    "pin21.jpeg", "pin22.jpeg", "pin23.jpeg", "pin24.jpeg", "pin25.jpeg",
  ];

  shuffleArray(imageKitPins); // Shuffle the image list

  const imageKitBase = "https://ik.imagekit.io/ogwfjtmj8/pins";

  const users = [];
  for (let i = 1; i <= 10; i++) {
    const hashedPassword = await bcrypt.hash("password123", 10);
    const user = new User({
      displayName: `User ${i}`,
      username: `user${i}`,
      email: `user${i}@example.com`,
      hashedPassword: hashedPassword,
      img: `https://picsum.photos/id/${i}/200/200`,
    });
    users.push(await user.save());
  }

  const boards = [];
  for (const user of users) {
    for (let i = 1; i <= 5; i++) {
      const board = new Board({
        title: `Board ${i} of ${user.username}`,
        user: user._id,
      });
      boards.push(await board.save());
    }
  }

  const pins = [];
  let pinIndex = 0;

  for (const user of users) {
    const userBoards = boards.filter(
      (board) => board.user.toString() === user._id.toString()
    );

    for (let i = 1; i <= 5; i++) {
      if (pinIndex >= imageKitPins.length) break; // Stop once we've used all 25 images

      const imageFile = imageKitPins[pinIndex];
      const media = `${imageKitBase}/${imageFile}`;
      const widths = [400, 500, 600, 700, 800];
      const heights = [600, 800, 1000, 1200, 1400];

      const width = widths[Math.floor(Math.random() * widths.length)];
      const height = heights[Math.floor(Math.random() * heights.length)];

      const pin = new Pin({
        media,
        width,
        height,
        title: `Pin ${i} by ${user.username}`,
        description: `This is pin ${i} created by ${user.username}`,
        link: `https://example.com/pin${i}`,
        board: userBoards[i - 1]?._id || userBoards[0]._id,
        tags: [`tag${i}`, "sample", user.username],
        user: user._id,
      });

      pins.push(await pin.save());
      pinIndex++;
    }

    if (pinIndex >= imageKitPins.length) break;
  }

  for (const user of users) {
    for (let i = 1; i <= 5; i++) {
      const randomPin = pins[Math.floor(Math.random() * pins.length)];
      const comment = new Comment({
        description: `Comment ${i} by ${user.username}: This is a great pin!`,
        pin: randomPin._id,
        user: user._id,
      });
      await comment.save();
    }
  }

  console.log("✅ Database seeded successfully with all 25 unique images!");
  process.exit(0);
};

seedDB().catch((error) => {
  console.error("❌ Error seeding database:", error);
  process.exit(1);
});
