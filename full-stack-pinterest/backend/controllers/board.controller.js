import Board from "../models/board.model.js";
import Pin from "../models/pin.model.js";

export const getUserBoards = async (req, res) => {
  const { userId } = req.params;

  try {
    const boards = await Board.find({ user: userId });

    const boardsWithPinDetails = await Promise.all(
      boards.map(async (board) => {
        const pinCount = await Pin.countDocuments({ board: board._id });
        const firstPin = await Pin.findOne({ board: board._id });

        if (!firstPin) return null; // Optionally skip empty boards

        return {
          ...board.toObject(),
          pinCount,
          firstPin,
        };
      })
    );

    const filteredBoards = boardsWithPinDetails.filter(Boolean);

    res.status(200).json(filteredBoards);
  } catch (err) {
    console.error(err);
    res.status(500).json("Failed to fetch boards");
  }
};
  