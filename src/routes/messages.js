const router = require("express").Router();
const Message = require("../models/Message");

//add

router.post("/", async (req, res) => {
  const newMessage = new Message(req.body);

  try {
    const savedMessage = await newMessage.save();
    const result = {
      status_code: 200,
      status_msg: `All messages fetched successfully`,
      data: savedMessage,
    };
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get

router.get("/:conversationId", async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });
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
