const contactService = require("../services/contactService.js");

const identifyContact = async (req, res, next) => {
  console.log('req:', req)
  try {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
      return res
        .status(400)
        .json({ error: "Either email or phoneNumber must be provided" });
    }

    const result = await contactService.consolidateContacts(email, phoneNumber);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { identifyContact };
