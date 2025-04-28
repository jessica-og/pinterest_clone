import Save from "../models/save.model.js";


// export const savePin = async (req, res) => {
//   try {
//     const { pinId } = req.body;
//     const userId = req.userId;

//    // console.log("SAVE ATTEMPT by USER:", userId, "PIN:", pinId); // 👈 DEBUG

//     if (!userId) return res.status(401).json("User not authenticated");

//     const alreadySaved = await Save.findOne({ pin: pinId, user: userId });
//     if (alreadySaved) {
//       return res.status(400).json({ message: "Pin already saved" });
//     }

//     const save = await Save.create({ pin: pinId, user: userId });
//     res.status(201).json(save);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Error saving pin" });
//   }
// };


export const getUserSaves = async (req, res) => {
    try {
      const { userId } = req.params;
      const saves = await Save.find({ user: userId }).populate("pin");
  
      // Filter out saves where the pin no longer exists
      const validSaves = saves.filter((save) => save.pin !== null);
  
      res.status(200).json(validSaves);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch saved pins" });
    }
  };
  