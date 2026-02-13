"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitContact = void 0;
const Contact_1 = require("../models/Contact");
const submitContact = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contactData = req.body;
        if (!contactData.email || !contactData.message) {
            return res.status(400).json({ message: 'Email and Message are required' });
        }
        const id = yield Contact_1.ContactModel.create(contactData);
        res.status(201).json({ message: 'Message sent successfully', id });
    }
    catch (error) {
        res.status(500).json({ message: 'Error sending message', error });
    }
});
exports.submitContact = submitContact;
