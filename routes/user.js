const router = require('express').Router();
const upload = require('../middlewares/upload');
const bcrypt = require('bcryptjs');
const imageHelper = require('../helpers/cloudinary');
const convertTo64 = require('../helpers/convertToBase64');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const validateUser = require('../middlewares/verifyToken');

router.use(validateUser);

router.get('/', (req, res) => {
  // req.headers
  return res.json(req.user);
});

router.patch('/', upload('single', 'photo'), async (req, res) => {
  const photo = req.file;
  const { display_name, bio, phone, password } = req.body;
  const user_id = req.user._id;

  try {
    let updateUser = { display_name, bio, phone };
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashPw = await bcrypt.hash(password, salt);
      updateUser.password = hashPw;
    }

    if (photo) {
      const base64 = convertTo64(photo);
      const { secure_url, public_id } = await imageHelper.upload(
        base64.content
      );
      updateUser.photo = secure_url;
    }

    let user = await User.findByIdAndUpdate(
      user_id,
      {
        $set: updateUser,
      },
      { new: true }
    );
    return res.json(user);
  } catch (error) {
    return res.json({
      message: 'Cannot update user!',
    });
  }
});

module.exports = router;
