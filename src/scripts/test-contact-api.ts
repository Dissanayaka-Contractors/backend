import axios from 'axios';

const run = async () => {
    try {
        const response = await axios.post('http://127.0.0.1:5000/api/contact', {
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            subject: 'Test Subject',
            message: 'This is a test message'
        });
        console.log('Response:', response.data);
    } catch (error: any) {
        console.error('Full Error:', error);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Error Message:', error.message);
        }
    }
};

run();
