const router = require('express').Router();
const verifyToken = require('../middlewares/verifyToken');
const Channel = require('../models/Channel');
const User = require('../models/User');

router.get('/search', async (req, res) => {
  try {
    const { searchTerm } = req.query;
    console.log(searchTerm);
    const channels = await Channel.find(
      {
        name: {
          $regex: new RegExp(searchTerm, 'i'),
        },
      },
      '_id name'
    );
    return res.json(channels);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal server error!' });
  }
});

// router.use(verifyToken);
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const channel = await Channel.findById(
      id,
      '_id name description members'
    ).populate({
      path: 'members.user',
      model: User,
      select: '_id display_name photo',
    });
    return res.json(channel);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error!' });
  }
});

router.get('/', async (req, res) => {
  try {
    const channels = await Channel.find({}, '_id name');
    return res.json(channels);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error!' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    let newChannel = new Channel({ name, description });
    newChannel = await newChannel.save();
    return res.json({
      name: newChannel.name,
      _id: newChannel._id,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error!' });
  }
});

module.exports = router;
