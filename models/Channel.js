const { Schema, model } = require('mongoose');

const channelSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    members: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        socket: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Channel = model('Channel', channelSchema);
module.exports = Channel;
