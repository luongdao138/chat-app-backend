const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const socketIO = require('socket.io');
const http = require('http');

const app = express();
const server = http.Server(app);

const io = socketIO(
  server,
  {
    cors: {
      origins: '*:*',
    },
    path: '/chat-app-socket.io',
  },
  ['polling', 'websocket']
);

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://loving-nobel-15448e.netlify.app',
    ],
    credentials: true,
  })
);

// connect mongodb database
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});
const db = mongoose.connection;
db.on('error', (error) => {
  console.log(error);
  process.exit(1);
});
db.on('open', () => {
  console.log('connected db successfully!');
});

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// routers
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const channelRouter = require('./routes/channel');
const messageRouter = require('./routes/message');

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/channels', channelRouter);
app.use('/api/messages', messageRouter);

const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server listenning on port ${PORT}`);
});

const User = require('./models/User');
const Channel = require('./models/Channel');

io.on('connection', (socket) => {
  console.log('a new user connected!');

  socket.on('joinChannel', async ({ channel_id, user_id }, cb) => {
    let channelObj = {};
    socket.join(channel_id);
    let channel = await Channel.findById(channel_id);
    const userAdded = channel.members.find(
      (c) => c.user.toString() === user_id.toString()
    );
    if (userAdded) {
      userAdded.socket = socket.id;
    } else {
      channel.members.push({
        user: user_id,
        socket: socket.id,
      });
      // channelObj
    }
    channel = await channel.save();
    cb();

    // emit to other members in the room
    channel = await Channel.findById(
      channel_id,
      '_id name description members'
    ).populate({
      path: 'members.user',
      model: User,
      select: '_id display_name photo',
    });
    channelObj.members = channel.members;
    channelObj.channel_id = channel_id;
    socket.to(channel_id).emit('joinChannel', channelObj);
  });

  socket.on('leaveChannel', async ({ channel_id, user_id }) => {
    const channel = await Channel.findById(channel_id);
    const userAdded = channel.members.find(
      (c) => c.user.toString() === user_id.toString()
    );
    userAdded.socket = null;
    await channel.save();
    socket.leave(channel_id);
  });

  socket.on('sendMessage', ({ newMessage, channel_id }) => {
    socket.to(channel_id).emit('sendMessage', newMessage);
  });

  socket.on('typing', ({ current_channel }) => {
    console.log('typing', current_channel);
    socket.to(current_channel).emit('typing');
  });

  socket.on('untyping', ({ current_channel }) => {
    socket.to(current_channel).emit('untyping');
  });

  socket.on('disconnect', () => {
    console.log('user disconnected!');
  });
});
