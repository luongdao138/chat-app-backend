const router = require('express').Router();
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const bcrypt = require('bcryptjs');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({
        message: 'Email or password is not correct!',
      });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(400).json({
        message: 'Email or password is not correct!',
      });

    const token = jwt.sign({ _id: user._id }, process.env.CLIENT_SECRET);
    return res.json({ token, user });
  } catch (error) {
    return res.status(500).json({
      message: 'Login failed!',
    });
  }
});

router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  let user = await User.findOne({ email });
  if (user)
    return res.status(400).json({
      message: 'Email already taken!',
    });

  const salt = await bcrypt.genSalt(10);
  const hashPw = await bcrypt.hash(password, salt);
  user = new User({
    email,
    password: hashPw,
  });
  user = await user.save();
  const token = jwt.sign({ _id: user._id }, process.env.CLIENT_SECRET);
  return res.json({ token, user });
});

router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    // get token from request

    // verify token
    const response = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, sub, picture, name } = response.getPayload();
    let user = await User.findOne({ social_id: sub });
    if (user) {
      const token = jwt.sign({ _id: user._id }, process.env.CLIENT_SECRET);
      return res.json({ token, user });
    }
    user = new User({
      social_id: sub,
      email,
      display_name: name,
      photo: picture,
    });
    user = await user.save();
    const token = jwt.sign({ _id: user._id }, process.env.CLIENT_SECRET);
    return res.json({ token, user });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: 'Google login failed!',
    });
  }
});

router.post('/facebook', async (req, res) => {
  try {
    const { userId, accessToken } = req.body;
    const url = `https://graph.facebook.com/v2.11/${userId}?fields=name,email,id,picture&access_token=${accessToken}`;
    const response = await axios.get(url);
    const { name, email, id, picture } = response.data;

    let user = await User.findOne({ social_id: id });
    if (user) {
      const token = jwt.sign({ _id: user._id }, process.env.CLIENT_SECRET);
      return res.json({ token, user });
    }
    user = new User({
      social_id: id,
      email,
      display_name: name,
      photo: picture?.data?.url,
    });
    user = await user.save();
    const token = jwt.sign({ _id: user._id }, process.env.CLIENT_SECRET);
    return res.json({ token, user });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: 'Facebook login failed!',
    });
  }
});

router.post('/github', async (req, res) => {
  try {
    const { access_token } = req.body;
    const url = 'https://api.github.com/user';
    const response = await axios.get(url, {
      headers: {
        Authorization: `token ${access_token}`,
      },
    });
    const { id, avatar_url, name, email } = response.data;

    let user = await User.findOne({ social_id: id });
    if (user) {
      const token = jwt.sign({ _id: user._id }, process.env.CLIENT_SECRET);
      return res.json({ token, user });
    }
    user = new User({
      social_id: id,
      email,
      display_name: name,
      photo: avatar_url,
    });
    user = await user.save();
    const token = jwt.sign({ _id: user._id }, process.env.CLIENT_SECRET);
    return res.json({ token, user });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: 'Facebook login failed!',
    });
  }
});

module.exports = router;
