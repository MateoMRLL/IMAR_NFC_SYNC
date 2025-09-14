const {
  sendVerificationCode,
  generateVerificationCode,
} = require("../utils/mailer");

const verificationCodes = new Map();

const CODE_EXPIRATION = 10 * 60 * 1000;
const MAX_ATTEMPTS = 3;

async function generateSendCode(userData) {
  if (!userData.name || !userData.email) {
    throw new Error("Missing required fields");
  }

  const code = generateVerificationCode();

  verificationCodes.set(userData.email, {
    code,
    name: userData.name,
    timestamp: Date.now(),
    attempts: 0,
  });

  setTimeout(() => verificationCodes.delete(userData.email), CODE_EXPIRATION);

  const sent = await sendVerificationCode(userData.email, userData.name, code);

  return sent
    ? { success: true, message: "Verification code sent" }
    : { success: false, message: "Error sending email" };
}
async function verifyCode(userData) {
  if (!userData.email || !userData.code) {
    throw new Error("Missing required fields");
  }

  const { email, code } = userData;
  const storedData = verificationCodes.get(email);

  if (!storedData) {
    return { success: false, message: "Code expired or invalid" };
  }

  if (Date.now() - storedData.timestamp > CODE_EXPIRATION) {
    verificationCodes.delete(email);
    return { success: false, message: "Code expired" };
  }

  if (storedData.attempts >= MAX_ATTEMPTS) {
    verificationCodes.delete(email);
    return {
      success: false,
      message: "Too many attempts. Request a new code.",
    };
  }

  if (storedData.code === code) {
    verificationCodes.delete(email);
    return { success: true, data: { name: storedData.name, email } };
  }

  storedData.attempts++;
  return {
    success: false,
    message: `Incorrect code. ${
      MAX_ATTEMPTS - storedData.attempts
    } attempts remaining.`,
  };
}

async function resendCode(userData) {
  if (!userData || !userData.email) {
    throw new Error("Missing required fields");
  }

  const { email } = userData;
  const storedData = verificationCodes.get(email);

  if (!storedData) {
    return {
      success: false,
      message: "No ongoing verification request for this email",
    };
  }

  const newCode = generateVerificationCode();

  verificationCodes.set(email, {
    ...storedData,
    code: newCode,
    timestamp: Date.now(),
    attempts: 0,
  });

  const sent = await sendVerificationCode(email, storedData.name, newCode);

  return sent
    ? { success: true, message: "New verification code sent" }
    : { success: false, message: "Error sending email" };
}

module.exports = {
  generateSendCode,
  verifyCode,
  resendCode,
};
