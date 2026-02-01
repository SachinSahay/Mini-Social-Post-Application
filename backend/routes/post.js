const express = require("express");
const Post = require("../models/post");

const router = express.Router();

/**
 * ======================
 * CREATE POST
 * ======================
 * POST /api/posts
 */
router.post("/", async (req, res) => {
  try {
    const { userId, username, text, image } = req.body;

    // validation: at least text or image
    if (!text && !image) {
      return res.status(400).json({
        message: "Post must have text or image",
      });
    }

    const newPost = new Post({
      userId,
      username,
      text,
      image,
    });

    await newPost.save();

    res.status(201).json({
      message: "Post created successfully",
      post: newPost,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
});

module.exports = router;
