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
exports.ContactModel = void 0;
const db_1 = require("../config/db");
exports.ContactModel = {
    create: (contact) => __awaiter(void 0, void 0, void 0, function* () {
        const db = (0, db_1.getDB)();
        const id = yield (0, db_1.getNextSequenceValue)('contactId');
        // MongoDB collections match old columns (e.g. first_name) from insert script mapping
        const newContact = {
            id,
            first_name: contact.firstName,
            last_name: contact.lastName,
            email: contact.email,
            subject: contact.subject,
            message: contact.message,
            created_at: new Date()
        };
        yield db.collection('contacts').insertOne(newContact);
        return id;
    })
};
