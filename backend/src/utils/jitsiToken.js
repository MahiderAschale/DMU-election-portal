const jwt = require("jsonwebtoken");
const fs  = require("fs");

const APP_ID = process.env.JAAS_APP_ID; 
const KID    = process.env.JAAS_KID;   

const resolvePrivateKey = () => {
  if (process.env.JAAS_PRIVATE_KEY_PATH) {
    return fs.readFileSync(process.env.JAAS_PRIVATE_KEY_PATH, "utf8");
  }
  // Inline env var — replace literal \n with real newlines
  return (process.env.JAAS_PRIVATE_KEY || "").replace(/\\n/g, "\n");
};

/**
 * @param {{ id: number|string, full_name: string, email: string }} user
 * @param {string}  roomName    - BARE room name only, NO app-id prefix, NO URL
 *                                e.g. "unielect-election-42-abc123"
 * @param {boolean} isModerator - true  → election manager or candidate speaking turn
 *                                false → voter or waiting candidate
 */
const generateJitsiToken = (user, roomName, isModerator = false) => {
  if (!APP_ID || !KID) {
    throw new Error("JAAS_APP_ID and JAAS_KID must be set in .env");
  }

  const PRIVATE_KEY = resolvePrivateKey();
  if (!PRIVATE_KEY || PRIVATE_KEY.length < 100) {
    throw new Error("JAAS_PRIVATE_KEY is missing or too short — check your .env");
  }

  const now = Math.floor(Date.now() / 1000);

  const payload = {
    iss:  "chat",    
    aud:  "jitsi",  
    sub:  APP_ID,   
    room: roomName, 
    iat:  now,
    exp:  now + 60 * 60 * 4, // 4 hours

    context: {
      user: {
        id:        String(user.id),
        name:      user.full_name || user.email || "Participant",
        email:     user.email     || "",
         moderator: isModerator ? "true" : "false"
      },
      features: {
        //  All feature values must also be strings, not booleans.
        recording:       isModerator ? "true" : "false",
        transcription:   isModerator ? "true" : "false",
        livestreaming:   "false",
        "outbound-call": "false"
      }
    }
  };

  return jwt.sign(payload, PRIVATE_KEY, {
    algorithm: "RS256",
    header: {
      alg: "RS256",
      kid: KID,  // ← tells JaaS which public key to verify against
      typ: "JWT"
    }
  });
};

module.exports = generateJitsiToken;