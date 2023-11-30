const { Contact } = require("../models/contact");
const { HttpError, ctrlWrapper } = require("../helpers");


const getContacts = async (req, res) => {
    const data = await Contact.find();
    res.json(data);
};

const getById = async (req, res) => {
    const { contactId } = req.params;
    const contact = await Contact.findById(contactId);
    if (!contact) {
      throw HttpError(404, "Not found");
    }
    res.json(contact);
};

const addContact = async (req, res) => {
    const data = await Contact.create(req.body);
    res.status(201).json(data);
};

const removeContact = async (req, res) => {
    const { contactId } = req.params;
    const result = await Contact.findByIdAndDelete(contactId);
    if (!result) {
      throw HttpError(404, "Not found");
    }
    res.json({ message: "contact deleted" });
};

const updateContact = async (req, res) => {
    const { contactId } = req.params;
    const data = await Contact.findByIdAndUpdate(contactId, req.body, {new: true});
    if (!data) {
      throw HttpError(404, "Not found");
    }
    res.json(data);
};

const updateStatusContact = async (req, res) => {
  const { contactId } = req.params;
  const data = await Contact.findByIdAndUpdate(contactId, req.body, {new: true});
  if (!data) {
    throw HttpError(404, "Not found");
  }
  res.json(data);
};

module.exports = {
  getContacts: ctrlWrapper(getContacts),
  getById: ctrlWrapper(getById),
  addContact: ctrlWrapper(addContact),
  removeContact: ctrlWrapper(removeContact),
  updateContact: ctrlWrapper(updateContact),
  updateStatusContact: ctrlWrapper(updateStatusContact),
};