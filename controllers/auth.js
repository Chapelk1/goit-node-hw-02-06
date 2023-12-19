const { User } = require("../models/user");
const { HttpError, ctrlWrapper, sendEmail } = require("../helpers");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const path = require('path');
const fs = require('fs/promises');
const Jimp = require("jimp");
const shortId = require('shortid')

const { SECRET_KEY, BASE_URL } = process.env;

const avatarsDir = path.join(__dirname, "../", "public", "avatars");



const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
      throw HttpError(409, "Email in use");
  }
  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);
  const verificationToken = shortId.generate();

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
    verificationToken,
  }); 

  const verificationEmail = {
    to: email,
    subject: "Verify email",
    text: `Hello ${email}`,
    html: `<p>Hello follow this link to verify your email.<a href="${BASE_URL}/users/verify/${verificationToken}" target="_blank"> click </a></p>
    <br/> <p>If it wasn't you, just delete this message!</p>`,
  };
  
  await sendEmail(verificationEmail);

  res.status(201).json({
    user: {
      subscription: newUser.subscription,
      email: newUser.email,
    },
  });
}

const verifyEmail = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });
  if (!user) {
    throw HttpError(404, "User not found")
  }
  await User.findByIdAndUpdate(user._id, { verify: true, verificationToken: "" })
  
  res.status(200).json({ message: "Verification successful" });
}

const resendVerifyEmail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, "Email not found");
  }
  if (user.verify) {
    throw HttpError(400, "Verification has already been passed");
  }

  const verificationEmail = {
    to: email,
    subject: "Verify email adress",
    text: `Hello ${email}`,
    html: `<p>Hello follow this link to verify your email.<a href="${BASE_URL}/users/verify/${user.verificationToken}" target="_blank"> click </a></p>
    <br/> <p>If it wasn't you, just delete this message!</p>`,
  };
  
  await sendEmail(verificationEmail);
  
  res.status(200).json({
    message: "Verification email sent",
  });
}

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
      throw HttpError(401, "Email or password is wrong");
  }
  
  if(!user.verify){
    throw HttpError(401, "Email not verified");
  }
  
  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
      throw HttpError(401, "Email or password is wrong");
  }

  const payload = {
      id: user._id
  }
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
  await User.findByIdAndUpdate(user._id, {token})
  res.json({
    token,
    user: {
      subscription: user.subscription,
      email: user.email,
    },
  });
}

const getCurrent = async (req, res) => {
    const { email, subscription } = req.user;
    res.json({
      subscription,
      email,
    });
}

const logout = async (req, res) => {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { token: "" });
    res.status(204).json()
}

const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: tempUpload, originalname } = req.file;
  const fileName = `${_id}_${originalname}`;
  const resultUpload = path.join(avatarsDir, fileName);

  const img = await Jimp.read(tempUpload);
  img.resize(250, 250)
  img.write(resultUpload);

  await fs.unlink(tempUpload);
  const avatarURL = path.join("avatars", fileName);
  await User.findByIdAndUpdate(_id, { avatarURL });
  res.json({
    avatarURL,
  })
}

module.exports = {
  register: ctrlWrapper(register),
  verifyEmail: ctrlWrapper(verifyEmail),
  resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
  login: ctrlWrapper(login),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
  updateAvatar: ctrlWrapper(updateAvatar),
};





