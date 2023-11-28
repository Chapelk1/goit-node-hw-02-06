const contacts = require("../models/contacts");
const { HttpError, ctrlWrapper } = require("../helpers");


const getContacts = async (req, res) => {
    const data = await contacts.listContacts();
    res.json(data);
};

const getById = async (req, res) => {
    const { contactId } = req.params;
    const contact = await contacts.getContactById(contactId);
    if (!contact) {
      throw HttpError(404, "Not found");
    }
    res.json(contact);
};

const addContact = async (req, res) => {
    const data = await contacts.addContact(req.body);
    res.status(201).json(data);
};

const removeContact = async (req, res) => {
    const { contactId } = req.params;
    const result = await contacts.removeContact(contactId);
    if (!result) {
      throw HttpError(404, "Not found");
    }
    res.json({ message: "contact deleted" });
};

const updateContact = async (req, res) => {
    const { contactId } = req.params;
    const data = await contacts.updateContact(contactId, req.body);
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
};