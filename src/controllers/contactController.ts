import { Request, Response } from 'express';
import { ContactModel, Contact } from '../models/Contact';

export const submitContact = async (req: Request, res: Response) => {
    try {
        const contactData: Contact = req.body;
        if (!contactData.email || !contactData.message) {
            return res.status(400).json({ message: 'Email and Message are required' });
        }
        const id = await ContactModel.create(contactData);
        res.status(201).json({ message: 'Message sent successfully', id });
    } catch (error) {
        res.status(500).json({ message: 'Error sending message', error });
    }
};
