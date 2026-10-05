const express = require("express");

const {
  authorizeYouTube,
  oauth2callback,
} = require("../controllers/googleYoutube.controller");

const router = express.Router();

// Start Google OAuth
router.get("/youtube", authorizeYouTube);

// Google OAuth callback
router.get("/oauth2callback", oauth2callback);

module.exports = router;