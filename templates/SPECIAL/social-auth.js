// ============================================================
// SOCIAL AUTH API — Google at Facebook Login
// 👉 BASE URL: /api/auth/social
// 👉 GAMITIN PARA SA: "Login with Google", "Login with Facebook"
// ============================================================
// PAANO GAMITIN:
//   1. npm install google-auth-library axios
//
//   Para sa Google:
//   - Pumunta sa https://console.cloud.google.com
//   - Gumawa ng OAuth 2.0 Client ID
//   - I-set sa .env: GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
//
//   Para sa Facebook:
//   - Pumunta sa https://developers.facebook.com
//   - Gumawa ng app, kunin ang App ID at Secret
//   - I-set sa .env: FACEBOOK_APP_ID=xxx
//                    FACEBOOK_APP_SECRET=xxx
//
//   2. sa server.js:  app.use("/api/auth/social", require("./templates/SPECIAL/social-auth"))
//
// WORKFLOW:
//   Frontend nagkuha ng token mula sa Google/Facebook SDK
//   → I-send ang token sa backend
//   → Backend mag-verify
//   → Mag-login o gumawa ng bagong account
//   → Mag-return ng JWT token
// ============================================================

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const config = require("../../config/config");
const { successResponse, errorResponse } = require("../../utils/response");

// 👉 I-uncomment pagkatapos ng npm install:
// const { OAuth2Client } = require("google-auth-library");
// const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// const axios = require("axios");

// -------------------------------------------------------
// DUMMY USER DATABASE — 👉 PALITAN NG TUNAY NA DATABASE
// -------------------------------------------------------
const users = [];

// -------------------------------------------------------
// HELPER: Hanapin o gumawa ng user mula sa social login
// -------------------------------------------------------
const findOrCreateUser = async ({ email, name, avatar, provider, providerId }) => {
  // 👉 PALITAN:
  // let user = await User.findOne({ email })
  // if (!user) {
  //   user = await User.create({ email, name, avatar, [`${provider}Id`]: providerId, isVerified: true })
  // } else if (!user[`${provider}Id`]) {
  //   user[`${provider}Id`] = providerId
  //   await user.save()
  // }
  // return user

  let user = users.find((u) => u.email === email);
  if (!user) {
    user = {
      id: Date.now().toString(),
      email,
      name,
      avatar,
      role: "user",
      isVerified: true,
      [`${provider}Id`]: providerId,
      createdAt: new Date(),
    };
    users.push(user);
  }
  return user;
};

// -------------------------------------------------------
// POST /api/auth/social/google — Google Login
// -------------------------------------------------------
router.post("/google", async (req, res) => {
  try {
    // 👉 "credential" = ang Google ID token mula sa frontend (Google Sign-In SDK)
    const { credential } = req.body;

    if (!credential) {
      return errorResponse(res, "Kailangan ang Google credential token.", 400);
    }

    // 👉 I-uncomment ang Google verification:
    // const ticket = await googleClient.verifyIdToken({
    //   idToken: credential,
    //   audience: process.env.GOOGLE_CLIENT_ID,
    // });
    // const payload = ticket.getPayload();
    // const { sub: googleId, email, name, picture: avatar } = payload;

    // PLACEHOLDER: Gamitin kung testing pa lang
    const { email, name, googleId } = req.body;
    if (!email) return errorResponse(res, "Google verification failed.", 401);

    const user = await findOrCreateUser({
      email,
      name,
      avatar: null,
      provider: "google",
      providerId: googleId || "placeholder",
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    return successResponse(res, "Matagumpay na nag-login gamit ang Google!", {
      token,
      user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar },
      isNewUser: users.length === 1, // 👉 PALITAN: i-check kung bago ang user sa DB
    });
  } catch (err) {
    console.error("[GOOGLE AUTH ERROR]", err);
    return errorResponse(res, "Hindi ma-verify ang Google account. Subukang muli.", 401);
  }
});

// -------------------------------------------------------
// POST /api/auth/social/facebook — Facebook Login
// -------------------------------------------------------
router.post("/facebook", async (req, res) => {
  try {
    // 👉 "accessToken" = ang Facebook access token mula sa frontend (Facebook Login SDK)
    const { accessToken, userId } = req.body;

    if (!accessToken || !userId) {
      return errorResponse(res, "Kailangan ang Facebook accessToken at userId.", 400);
    }

    // 👉 I-uncomment ang Facebook verification:
    // const fbResponse = await axios.get(
    //   `https://graph.facebook.com/v18.0/${userId}?fields=id,name,email,picture&access_token=${accessToken}`
    // );
    // const { id: facebookId, name, email, picture } = fbResponse.data;
    // const avatar = picture?.data?.url;

    // PLACEHOLDER:
    const { email, name } = req.body;
    if (!email) return errorResponse(res, "Facebook verification failed.", 401);

    const user = await findOrCreateUser({
      email,
      name,
      avatar: null,
      provider: "facebook",
      providerId: userId,
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    return successResponse(res, "Matagumpay na nag-login gamit ang Facebook!", {
      token,
      user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar },
    });
  } catch (err) {
    console.error("[FACEBOOK AUTH ERROR]", err);
    return errorResponse(res, "Hindi ma-verify ang Facebook account. Subukang muli.", 401);
  }
});

// -------------------------------------------------------
// GET /api/auth/social/providers — Listahan ng available social logins
// -------------------------------------------------------
router.get("/providers", (req, res) => {
  return successResponse(res, "Available social login providers.", {
    // 👉 PALITAN KUNG ANO LANG ANG AVAILABLE SA IYONG APP
    providers: [
      { name: "Google", available: !!process.env.GOOGLE_CLIENT_ID },
      { name: "Facebook", available: !!(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) },
    ],
  });
});

module.exports = router;
