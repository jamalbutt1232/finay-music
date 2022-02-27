const router = require("express").Router();
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

//add

router.post("/", async (req, res) => {
  const newMessage = new Message(req.body);
  const { conversationId, text } = newMessage;

  try {
    const savedMessage = await newMessage.save();
    await Conversation.findByIdAndUpdate(conversationId, {
      $set: { lastMsg: text },
    });
    const result = {
      status_code: 200,
      status_msg: `Message Sent successfully`,
      data: savedMessage,
    };
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get
//
router.get("/:conversationId", async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    }).sort({ createdAt: -1 });
    const result = {
      status_code: 200,
      status_msg: `All messages fetched successfully`,
      data: messages,
    };
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
