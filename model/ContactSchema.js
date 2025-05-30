const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema({
  phoneNumber: { type: String },
  email: { type: String },
  linkedId: { type: mongoose.Schema.Types.ObjectId, ref: "Contact" },
  linkPrecedence: {
    type: String,
    enum: ["primary", "secondary"],
    default: "primary",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date },
});

module.exports = mongoose.model("Contact", ContactSchema);
