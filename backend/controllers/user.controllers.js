import uploadOnCloudinary from "../config/cloudinary.js";
import geminiResponse from "../gemini.js";
import User from "../models/user.model.js";
import moment from "moment/moment.js";
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId; // Assuming userId is set by the isAuth middleware
    const user = await User.findById(userId).select("-password -__v"); // Exclude password and version key from the response
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching current user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateAssistant = async (req, res) => {
  try {
    const { assistantName, imageUrl } = req.body;
    let assistantImage;
    if (imageUrl) {
      assistantImage = imageUrl; // if given image are selected from frontend
    } else {
      assistantImage = await uploadOnCloudinary(req.file.path); // if image is uploaded from input
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { assistantName, assistantImage },
      { new: true }
    ).select("-password");
    return res.status(200).json(user);
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Error updating assistant", error: error.message });
  }
};

export const askToAssistant = async (req, res) => {
  try {
    const { command } = req.body;
    const user = await User.findById(req.userId);
    user.history.push(command);
    user.save(); // Save the command to user's history
    const userName = user.name;
    const assistantName = user.assistantName;

    const result = await geminiResponse(command, assistantName, userName);

    const jsonMatch = result.match(/{[\s\S]*}/);
    if (!jsonMatch) {
      return res.status(400).json({ message: "Invalid response format" });
    }
    const geminiResult = JSON.parse(jsonMatch[0]);
    const type = geminiResult.type;
    switch (type) {
      case "get_date":
        return res.json({
          type,
          userInput: geminiResult.userInput,
          response: `current date is ${moment().format("YYYY-MM-DD")}`,
        });
      case "get_time":
        return res.json({
          type,
          userInput: geminiResult.userInput,
          response: `current time is ${moment().format("HH:mm:A")}`,
        });
      case "get_day":
        return res.json({
          type,
          userInput: geminiResult.userInput,
          response: `current day is ${moment().format("dddd")}`,
        });
      case "get_month":
        return res.json({
          type,
          userInput: geminiResult.userInput,
          response: `current month is ${moment().format("MMMM")}`,
        });
      case "google_search":
      case "youtube_search":
      case "youtube_video":
      case "youtube_play":
      case "general":
      case "get_weather":
      case "calculator_open":
      case "instagram_open":
      case "facebook_open":
      case "twitter_open":
      case "linkedin_open":
      case "github_open":
      case "open_website":
      case "get_news":
      case "get_quote":
        return res.json({
          type,
          userInput: geminiResult.userInput,
          response: geminiResult.response,
        });

      default:
        return res.status(400).json({
          response: "Unknown command type",
        });
    }
  } catch (error) {
    console.error("Error processing command:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
