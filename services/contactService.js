const Contact = require("../model/ContactSchema");

const consolidateContacts = async (email, phoneNumber) => {
  // Find all contacts that match either email or phoneNumber
  const matchingContacts = await Contact.find({
    $or: [{ email: email }, { phoneNumber: phoneNumber }],
    deletedAt: null,
  }).sort({ createdAt: 1 }); // Sort by creation time to find the oldest

  if (matchingContacts.length === 0) {
    // No existing contacts, create a new primary contact
    const newContact = await Contact.create({
      email: email,
      phoneNumber: phoneNumber,
      linkPrecedence: "primary",
    });

    return formatResponse(newContact, []);
  }

  // Find the primary contact (could be the oldest or one linked to the oldest)
  let primaryContact = matchingContacts.find(
    (contact) => contact.linkPrecedence === "primary"
  );

  if (!primaryContact) {
    // All matching contacts are secondary, find their primary
    const primaryContactIds = [
      ...new Set(matchingContacts.map((c) => c.linkedId)),
    ];
    primaryContact = await Contact.findOne({
      _id: { $in: primaryContactIds },
      linkPrecedence: "primary",
      deletedAt: null,
    });
  }

  // If still no primary (shouldn't happen if data is consistent), use the oldest as primary
  if (!primaryContact) {
    primaryContact = matchingContacts[0];
    primaryContact.linkPrecedence = "primary";
    await primaryContact.save();
  }

  // Check if we need to create a new secondary contact
  const shouldCreateSecondary =
    (email && !matchingContacts.some((c) => c.email === email)) ||
    (phoneNumber &&
      !matchingContacts.some((c) => c.phoneNumber === phoneNumber));

  let newSecondaryContact = null;

  if (shouldCreateSecondary) {
    newSecondaryContact = await Contact.create({
      email: email,
      phoneNumber: phoneNumber,
      linkedId: primaryContact._id,
      linkPrecedence: "secondary",
    });
  }

  // Find all contacts linked to this primary (including itself)
  const allLinkedContacts = await Contact.find({
    $or: [{ _id: primaryContact._id }, { linkedId: primaryContact._id }],
    deletedAt: null,
  });

  // Check for any primary contacts that should be converted to secondary
  const otherPrimaryContacts = matchingContacts.filter(
    (c) => c.linkPrecedence === "primary" && !c._id.equals(primaryContact._id)
  );

  for (const contact of otherPrimaryContacts) {
    contact.linkPrecedence = "secondary";
    contact.linkedId = primaryContact._id;
    contact.updatedAt = new Date();
    await contact.save();

    // Update all contacts linked to this one to now link to the primary
    await Contact.updateMany(
      { linkedId: contact._id, deletedAt: null },
      { $set: { linkedId: primaryContact._id, updatedAt: new Date() } }
    );
  }

  // Refresh the list of linked contacts after potential updates
  const updatedLinkedContacts = await Contact.find({
    $or: [{ _id: primaryContact._id }, { linkedId: primaryContact._id }],
    deletedAt: null,
  });

  return formatResponse(primaryContact, updatedLinkedContacts);
};

const formatResponse = (primaryContact, linkedContacts) => {
  const emails = [];
  const phoneNumbers = [];
  const secondaryContactIds = [];

  // Always include primary contact data first
  if (primaryContact.email) emails.push(primaryContact.email);
  if (primaryContact.phoneNumber) phoneNumbers.push(primaryContact.phoneNumber);

  // Process all linked contacts
  linkedContacts.forEach((contact) => {
    if (contact._id.toString() !== primaryContact._id.toString()) {
      secondaryContactIds.push(contact._id);
    }

    if (contact.email && !emails.includes(contact.email)) {
      emails.push(contact.email);
    }

    if (contact.phoneNumber && !phoneNumbers.includes(contact.phoneNumber)) {
      phoneNumbers.push(contact.phoneNumber);
    }
  });

  return {
    contact: {
      primaryContatctId: primaryContact._id,
      emails,
      phoneNumbers,
      secondaryContactIds,
    },
  };
};

module.exports = { consolidateContacts };
