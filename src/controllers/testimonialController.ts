import { Request, Response } from 'express';
import { TestimonialModel } from '../models/Testimonial';

export const getTestimonials = async (req: Request, res: Response) => {
    try {
        const testimonials = await TestimonialModel.findAll();
        res.json(testimonials);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching testimonials', error });
    }
};
