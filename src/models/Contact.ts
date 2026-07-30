import { getDB, getNextSequenceValue } from '../config/db';

export interface Contact {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    subject: string;
    message: string;
}

export const ContactModel = {
    create: async (contact: Contact): Promise<number> => {
        const db = getDB();
        const id = await getNextSequenceValue('contactId');
        
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
        await db.collection('contacts').insertOne(newContact);
        return id;
    }
};
