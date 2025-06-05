
import Imagekit from "imagekit";
import Pin from "../models/pin.model.js";
import User from "../models/user.model.js";
import Like from "../models/like.model.js";
import Save from "../models/save.model.js";
import Board from "../models/board.model.js";
import sharp from "sharp";
import jwt from "jsonwebtoken";




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

  const metadata = await sharp(media.data).metadata();

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
  
  const imagekit = new Imagekit({
    publicKey: process.env.IK_PUBLIC_KEY,
    privateKey: process.env.IK_PRIVATE_KEY,
    urlEndpoint: process.env.IK_URL_ENDPOINT,
  });

  const textLeftPosition = Math.round((parsedTextOptions.left * width) / 375);
  const textTopPosition = Math.round(
    (parsedTextOptions.top * height) / parsedCanvasOptions.height
  );

  // FIXED TRANSFORMATION STRING

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

  imagekit
  .upload({
    file: media.data,
    fileName: media.name,
    folder: "test",
    transformation: {
      pre: transformationString,
    },
  })
  .then(async (response) => {
    // FIXED: ADD NEW BOARD
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

    // Update board with reference to created pin
    await Board.findByIdAndUpdate(newBoardId, {
      createdForPin: newPin._id,
    });

    // Log the newly created pin and FileId for deletion
    console.log("Created Pin:", newPin);
    console.log("Deleting file with FileId:", response.fileId);

    // Send response only after everything is done
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

    // Validate and handle the board FileId
    let boardId = board === "" ? null : board;

    let mediaPath = pin.media;
    let width = pin.width;
    let height = pin.height;
    let fileId = pin.imageKitFileId; // ✅ Declare fileId properly

    // 1. If user removed previous image
    if (removeExistingImage === "true" && pin.media) {
      try {
        const fullImageUrl = `${process.env.IK_URL_ENDPOINT}${pin.media}`;
        await imagekit.purgeCache(fullImageUrl);
        console.log(`Cache invalidated for: ${fullImageUrl}`);

        if (fileId) {
          await imagekit.deleteFile(fileId);
          mediaPath = "";
          width = 0;
          height = 0;
          fileId = null;
        } else {
          console.log("No fileId available for deletion");
        }
      } catch (err) {
        console.error("Failed to delete image from ImageKit or invalidate cache:", err);
      }
    }

    // 2. If user uploaded a new file (if media exists)
    const media = req.files?.media;
    if (media) {
      try {
        const oldFileId = pin.imageKitFileId;
        const oldFullUrl = `${process.env.IK_URL_ENDPOINT}${pin.media}`;

        if (oldFileId) {
          try {
            await imagekit.purgeCache(oldFullUrl);
            await imagekit.deleteFile(oldFileId);
            console.log(`Deleted old image: ${oldFullUrl}`);
          } catch (err) {
            console.error("Failed to delete old image:", err);
          }
        }

       const parsedTextOptions = JSON.parse(textOptions || "{}");
      
        const parsedCanvasOptions = JSON.parse(canvasOptions || "{}");

        const metadata = await sharp(media.data).metadata();
        const originalAspectRatio = metadata.width / metadata.height;

        const clientAspectRatio =
          parsedCanvasOptions.size !== "original"
            ? parsedCanvasOptions.size.split(":")[0] / parsedCanvasOptions.size.split(":")[1]
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
            const originalOrientation =
              metadata.width < metadata.height ? "portrait" : "landscape";
          
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
          file: media.data,
          fileName: media.name,
          folder: "test",
          transformation: { pre: transformationString },
        });

        mediaPath = uploadRes.filePath;
        width = uploadRes.width;
        height = uploadRes.height;
        fileId = uploadRes.fileId; // ✅ Store new fileId

        console.log(`New image uploaded, path: ${mediaPath}`);

        await Pin.findByIdAndUpdate(req.params.id, {
          $set: { imageKitFileId: fileId },
        });

        if (!fileId) {
          console.warn("Warning: New image uploaded but fileId is missing!");
        }
      } catch (err) {
        console.error("Failed to upload new image to ImageKit:", err);
      }
    }

    // 3. Update the pin with the new details
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

    console.log("Final fileId used:", fileId);
    console.log("Created Pin:", updatedPin);

    res.status(200).json(updatedPin);
  } catch (err) {
    console.log("Error updating pin:", err);
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








