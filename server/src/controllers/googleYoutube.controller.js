const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const YOUTUBE_SCOPES = [
  "https://www.googleapis.com/auth/youtube",
];

// Start Google OAuth
const authorizeYouTube = (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: YOUTUBE_SCOPES,
  });

  console.log("Google OAuth URL generated");

  res.redirect(authUrl);
};

// Google redirects here after authorization
const oauth2callback = async (req, res) => {
  try {
    const { code, error } = req.query;

    if (error) {
      console.error("Google OAuth error:", error);

      return res.status(400).send(
        `Google authorization failed: ${error}`
      );
    }

    if (!code) {
      return res.status(400).send(
        "Missing authorization code. Start from /youtube."
      );
    }

    console.log("OAuth authorization code received.");

    const { tokens } = await oauth2Client.getToken(code);

    console.log("OAuth tokens received.");

    if (!tokens.refresh_token) {
      console.log("No refresh token returned.");
      console.log(tokens);

      return res.status(400).send(
        "No refresh token was returned. Revoke MoneyMind's previous Google access and authorize again."
      );
    }

    console.log("\n======================================");
    console.log("YOUTUBE_REFRESH_TOKEN");
    console.log("======================================");
    console.log(tokens.refresh_token);
    console.log("======================================\n");

    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>MoneyMind YouTube Authorization</title>
        </head>
        <body>
          <h2>YouTube authorization successful ✅</h2>
          <p>Check your backend terminal for the refresh token.</p>
          <p>Add it to:</p>
          <pre>YOUTUBE_REFRESH_TOKEN=...</pre>
          <p>Then restart your backend.</p>
        </body>
      </html>
    `);

  } catch (err) {
    console.error(
      "OAuth callback error:",
      err.response?.data || err.message
    );

    return res.status(500).send(
      "OAuth callback failed. Check the backend terminal."
    );
  }
};

module.exports = {
  authorizeYouTube,
  oauth2callback,
};