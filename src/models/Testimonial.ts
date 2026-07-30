import { getDB } from '../config/db';

export interface Testimonial {
    id?: number;
    name: string;
    role: string;
    text: string;
}

export const TestimonialModel = {
    findAll: async (): Promise<Testimonial[]> => {
        const db = getDB();
        const testimonials = await db.collection('testimonials').find().toArray();
        return testimonials as unknown as Testimonial[];
    }
};
