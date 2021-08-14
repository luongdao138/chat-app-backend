const router = require('express').Router();
const Message = require('../models/Message');
const User = require('../models/User');
const verifyToken = require('../middlewares/verifyToken');

router.get('/:channelId', async (req, res) => {
  const { channelId } = req.params;
  try {
    const messages = await Message.find({ channel: channelId }).populate({
      path: 'sender',
      model: User,
      select: '_id display_name photo',
    });
    return res.json(messages);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error!' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  const user = req.user;
  try {
    const { channel, text } = req.body;
    let newMessage = new Message({
      channel,
      text,
      sender: user._id,
    });
    newMessage = await newMessage.save();
    return res.json({
      _id: newMessage._id,
      channel: newMessage.channel,
      text: newMessage.text,
      createdAt: newMessage.createdAt,
      sender: {
        display_name: user.display_name,
        photo: user.photo,
        _id: user._id,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error!' });
  }
});

module.exports = router;
