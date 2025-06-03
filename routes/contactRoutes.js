const express = require("express");
const { identifyContact } = require("../controller/contactController");

const router = express.Router();

router.post("/identify", identifyContact);

module.exports = router;
