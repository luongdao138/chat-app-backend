const { Schema, model } = require('mongoose');

const messageSchema = new Schema(
  {
    text: { type: String, required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    channel: { type: Schema.Types.ObjectId, ref: 'Channel' },
  },
  {
    timestamps: true,
  }
);

const Message = model('Message', messageSchema);
module.exports = Message;
