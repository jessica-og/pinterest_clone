
import Imagekit from "imagekit";
import Pin from "../models/pin.model.js";
import User from "../models/user.model.js";
import Like from "../models/like.model.js";
import Save from "../models/save.model.js";
import Board from "../models/board.model.js";
import sharp from "sharp";
import jwt from "jsonwebtoken";


export const getPins = async (req, res) => {
  const pageNumber = Number(req.query.cursor) || 0;
  const search = req.query.search;
  const userId = req.query.userId;
  const boardId = req.query.boardId;
  const LIMIT = 21;

  let filter = {};

  if (search) {
    filter = {
      $or: [
        { title: { $regex: search, $options: "i" } },
        { tags: { $in: [search] } },
      ],
    };
  } else if (userId) {
    filter = { user: userId };
  } else if (boardId) {
    filter = { board: boardId };
  }

  try {
    const pins = await Pin.find(filter)
      .populate("user", "_id username img displayName") // <-- this line ensures user info is included
      .sort({ createdAt: -1 }) 
      .limit(LIMIT)
      .skip(pageNumber * LIMIT);

    const hasNextPage = pins.length === LIMIT;

    res.status(200).json({ pins, nextCursor: hasNextPage ? pageNumber + 1 : null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch pins" });
  }
};

export const getPin = async (req, res) => {
  const { id } = req.params;
  const pin = await Pin.findById(id).populate(
    "user",
    "username img displayName"
  );

  console.log(pin);
  res.status(200).json(pin);
};



export const interactionCheck = async (req, res) => {
  const { id } = req.params;
  const token = req.cookies.token;

  const likeCount = await Like.countDocuments({ pin: id });

  if (!token) {
    return res.status(200).json({ likeCount, isLiked: false, isSaved: false });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
    if (err) {
      return res
        .status(200)
        .json({ likeCount, isLiked: false, isSaved: false });
    }

    const userId = payload.userId;

    const isLiked = await Like.findOne({
      user: userId,
      pin: id,
    });
    const isSaved = await Save.findOne({
      user: userId,
      pin: id,
    });

    return res.status(200).json({
      likeCount,
      isLiked: isLiked ? true : false,
      isSaved: isSaved ? true : false,
    });
  });
};

export const interact = async (req, res) => {
  const { id } = req.params;

  const { type } = req.body;

  if (type === "like") {
    const isLiked = await Like.findOne({
      pin: id,
      user: req.userId,
    });

    if (isLiked) {
      await Like.deleteOne({
        pin: id,
        user: req.userId,
      });
    } else {
      await Like.create({
        pin: id,
        user: req.userId,
      });
    }
  } else {
    const isSaved = await Save.findOne({
      pin: id,
      user: req.userId,
    });

    if (isSaved) {
      await Save.deleteOne({
        pin: id,
        user: req.userId,
      });
    } else {
      await Save.create({
        pin: id,
        user: req.userId,
      });
    }
  }

  return res.status(200).json({ message: "Successful" });
};


export const createPin = async (req, res) => {
  const {
    title,
    description,
    link,
    board,
    tags,
    textOptions,
    canvasOptions,
    newBoard,
  } = req.body;

  const media = req.files.media;

  if (!title || !description || !media) {
    return res.status(400).json({ message: "All FileIds are required!" });
  }

  const parsedTextOptions = JSON.parse(textOptions || "{}");
  const parsedCanvasOptions = JSON.parse(canvasOptions || "{}");

  // Step 1: Get original metadata
  const originalMetadata = await sharp(media.data).metadata();

  // Step 2: Resize the image if it's too large
  const MAX_WIDTH = 1024;
  const MAX_HEIGHT = 1024;

  let resizedBuffer = media.data;

  if (
    originalMetadata.width > MAX_WIDTH ||
    originalMetadata.height > MAX_HEIGHT
  ) {
    resizedBuffer = await sharp(media.data)
      .resize({
        width: MAX_WIDTH,
        height: MAX_HEIGHT,
        fit: "inside",
        withoutEnlargement: true,
      })
      .toBuffer();
  }

  // Step 3: Get resized metadata
  const metadata = await sharp(resizedBuffer).metadata();

  const originalOrientation =
    metadata.width < metadata.height ? "portrait" : "landscape";
  const originalAspectRatio = metadata.width / metadata.height;

  let clientAspectRatio;
  let width;
  let height;

  if (parsedCanvasOptions.size !== "original") {
    clientAspectRatio =
      parsedCanvasOptions.size.split(":")[0] /
      parsedCanvasOptions.size.split(":")[1];
  } else {
    parsedCanvasOptions.orientation === originalOrientation
      ? (clientAspectRatio = originalOrientation)
      : (clientAspectRatio = 1 / originalAspectRatio);
  }

  if (parsedCanvasOptions.size !== "original") {
    width = metadata.width;
    height = metadata.width / clientAspectRatio;
  } else {
    width = metadata.width;
    height = metadata.height;
  }

  // Step 4: ImageKit init
  const imagekit = new Imagekit({
    publicKey: process.env.IK_PUBLIC_KEY,
    privateKey: process.env.IK_PRIVATE_KEY,
    urlEndpoint: process.env.IK_URL_ENDPOINT,
  });

  const textLeftPosition = Math.round((parsedTextOptions.left * width) / 375);
  const textTopPosition = Math.round(
    (parsedTextOptions.top * height) / parsedCanvasOptions.height
  );

  // Step 5: Build transformation string
  let croppingStrategy = "";

  if (parsedCanvasOptions.size !== "original") {
    if (originalAspectRatio > clientAspectRatio) {
      croppingStrategy = ",cm-pad_resize";
    }
  } else {
    if (
      originalOrientation === "landscape" &&
      parsedCanvasOptions.orientation === "portrait"
    ) {
      croppingStrategy = ",cm-pad_resize";
    }
  }

  const transformationString = `w-${width},h-${height}${croppingStrategy},bg-${parsedCanvasOptions.backgroundColor.substring(
    1
  )}${
    parsedTextOptions.text
      ? `,l-text,i-${parsedTextOptions.text},fs-${
          parsedTextOptions.fontSize * 2.1
        },lx-${textLeftPosition},ly-${textTopPosition},co-${parsedTextOptions.color.substring(
          1
        )},l-end`
      : ""
  }`;

  // Step 6: Upload to ImageKit
  imagekit
    .upload({
      file: resizedBuffer,
      fileName: media.name,
      folder: "test",
      transformation: {
        pre: transformationString,
      },
    })
    .then(async (response) => {
      let newBoardId;

      if (newBoard) {
        const res = await Board.create({
          title: newBoard,
          user: req.userId,
          createdForPin: null,
        });
        newBoardId = res._id;
      }

      const newPin = await Pin.create({
        user: req.userId,
        title,
        description,
        link: link || null,
        board: newBoardId || board || null,
        tags: Array.isArray(tags)
          ? tags
          : typeof tags === "string"
          ? tags.split(",").map((tag) => tag.trim())
          : [],
        media: response.filePath,
        imageKitFileId: response.fileId,
        width: response.width,
        height: response.height,
      });

      if (newBoardId) {
        await Board.findByIdAndUpdate(newBoardId, {
          createdForPin: newPin._id,
        });
      }

      console.log("Created Pin:", newPin);
      console.log("Deleting file with FileId:", response.fileId);

      return res.status(201).json(newPin);
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json(err);
    });
};


export const updatePin = async (req, res) => {
  try {
    const imagekit = new Imagekit({
      publicKey: process.env.IK_PUBLIC_KEY,
      privateKey: process.env.IK_PRIVATE_KEY,
      urlEndpoint: process.env.IK_URL_ENDPOINT,
    });

    const pin = await Pin.findById(req.params.id);
    if (!pin) return res.status(404).json("Pin not found");
    if (pin.user.toString() !== req.userId)
      return res.status(403).json("You can only edit your own pins");

    const {
      title,
      description,
      link,
      board,
      tags,
      textOptions,
      canvasOptions,
      newBoard,
      removeExistingImage,
    } = req.body;

    let boardId = board === "" ? null : board;
    let mediaPath = pin.media;
    let width = pin.width;
    let height = pin.height;
    let fileId = pin.imageKitFileId;

    // 1. Remove old image if requested
    if (removeExistingImage === "true" && pin.media) {
      try {
        const fullImageUrl = `${process.env.IK_URL_ENDPOINT}${pin.media}`;
        await imagekit.purgeCache(fullImageUrl);
        if (fileId) {
          await imagekit.deleteFile(fileId);
          mediaPath = "";
          width = 0;
          height = 0;
          fileId = null;
        }
      } catch (err) {
        console.error("Error deleting old image:", err);
      }
    }

    // 2. Upload new image if provided
    const media = req.files?.media;
    if (media) {
      try {
        const oldFileId = pin.imageKitFileId;
        const oldFullUrl = `${process.env.IK_URL_ENDPOINT}${pin.media}`;
        if (oldFileId) {
          try {
            await imagekit.purgeCache(oldFullUrl);
            await imagekit.deleteFile(oldFileId);
          } catch (err) {
            console.error("Failed to delete old image:", err);
          }
        }

        const parsedTextOptions = JSON.parse(textOptions || "{}");
        const parsedCanvasOptions = JSON.parse(canvasOptions || "{}");

        // Step 1: Resize image if necessary
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        const originalMetadata = await sharp(media.data).metadata();

        let resizedBuffer = media.data;
        if (
          originalMetadata.width > MAX_WIDTH ||
          originalMetadata.height > MAX_HEIGHT
        ) {
          resizedBuffer = await sharp(media.data)
            .resize({
              width: MAX_WIDTH,
              height: MAX_HEIGHT,
              fit: "inside",
              withoutEnlargement: true,
            })
            .toBuffer();
        }

        const metadata = await sharp(resizedBuffer).metadata();
        const originalAspectRatio = metadata.width / metadata.height;
        const originalOrientation =
          metadata.width < metadata.height ? "portrait" : "landscape";

        const clientAspectRatio =
          parsedCanvasOptions.size !== "original"
            ? parsedCanvasOptions.size.split(":")[0] /
              parsedCanvasOptions.size.split(":")[1]
            : originalAspectRatio;

        width = metadata.width;
        height =
          parsedCanvasOptions.size !== "original"
            ? metadata.width / clientAspectRatio
            : metadata.height;

        const textLeftPosition = Math.round((parsedTextOptions.left * width) / 375);
        const textTopPosition = Math.round(
          (parsedTextOptions.top * height) / parsedCanvasOptions.height
        );

        let croppingStrategy = "";

        if (parsedCanvasOptions.size !== "original") {
          const parsedOrientation = parsedCanvasOptions.orientation || originalOrientation;

          if (originalAspectRatio > clientAspectRatio) {
            croppingStrategy = ",cm-pad_resize";
          } else if (
            originalOrientation === "landscape" &&
            parsedOrientation === "portrait"
          ) {
            croppingStrategy = ",cm-pad_resize";
          }
        }

        const transformationString = `w-${width},h-${height}${croppingStrategy},bg-${parsedCanvasOptions.backgroundColor.substring(
          1
        )}${
          parsedTextOptions.text
            ? `,l-text,i-${parsedTextOptions.text},fs-${
                parsedTextOptions.fontSize * 2.1
              },lx-${textLeftPosition},ly-${textTopPosition},co-${parsedTextOptions.color.substring(
                1
              )},l-end`
            : ""
        }`;

        const uploadRes = await imagekit.upload({
          file: resizedBuffer,
          fileName: media.name,
          folder: "test",
          transformation: { pre: transformationString },
        });

        mediaPath = uploadRes.filePath;
        width = uploadRes.width;
        height = uploadRes.height;
        fileId = uploadRes.fileId;

        await Pin.findByIdAndUpdate(req.params.id, {
          $set: { imageKitFileId: fileId },
        });
      } catch (err) {
        console.error("Failed to upload new image:", err);
      }
    }

    // 3. Update pin
    const updatedPin = await Pin.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          title,
          description,
          link,
          board: boardId,
          tags: Array.isArray(tags)
            ? tags
            : typeof tags === "string"
            ? tags.split(",").map((tag) => tag.trim())
            : [],
          media: mediaPath,
          width,
          height,
        },
      },
      { new: true }
    );

    console.log("Updated pin with fileId:", fileId);
    res.status(200).json(updatedPin);
  } catch (err) {
    console.error("Error updating pin:", err);
    res.status(500).json({ message: err.message || "Something went wrong." });
  }
};




export const deletePin = async (req, res) => {
  try {
    const imagekit = new Imagekit({
      publicKey: process.env.IK_PUBLIC_KEY,
      privateKey: process.env.IK_PRIVATE_KEY,
      urlEndpoint: process.env.IK_URL_ENDPOINT,
    });
    const pin = await Pin.findById(req.params.id);
    if (!pin) return res.status(404).json("Pin not found");
    if (pin.user.toString() !== req.userId)
      return res.status(403).json("You can only delete your own pins");

    // Delete image from ImageKit
    if (pin.imageKitFileId) {
      await imagekit.deleteFile(pin.imageKitFileId);
    }

    // Delete the pin
    await Pin.findByIdAndDelete(req.params.id);

    // Delete associated board, if any
    const board = await Board.findOne({ createdForPin: pin._id });
    if (board) {
      await Board.findByIdAndDelete(board._id);
    }

    res.status(200).json("Pin, image, and associated board deleted successfully");
  } catch (err) {
    console.error(err);
    res.status(500).json("Failed to delete pin");
  }
};








