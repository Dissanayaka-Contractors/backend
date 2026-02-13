import axios from 'axios';

const API_URL = 'http://localhost:5001/api/auth';

const testAuth = async () => {
    try {
        console.log('Testing Admin Login...');
        const adminLogin = await axios.post(`${API_URL}/login`, {
            email: 'admin@dissanayaka.lk',
            password: 'admin123'
        });
        console.log('Admin Login Success:', adminLogin.data.token ? 'Token received' : 'No token');

        console.log('\nTesting User Registration...');
        const timestamp = Date.now();
        const newUser = {
            username: `Test User ${timestamp}`,
            email: `test${timestamp}@example.com`,
            password: 'password123'
        };
        const register = await axios.post(`${API_URL}/register`, newUser);
        console.log('User Registration Success:', register.data.id ? 'User created' : 'Failed');

        console.log('\nTesting User Login...');
        const userLogin = await axios.post(`${API_URL}/login`, {
            email: newUser.email,
            password: newUser.password
        });
        console.log('User Login Success:', userLogin.data.token ? 'Token received' : 'No token');

    } catch (error: any) {
        console.error('Auth Test Failed:', error.response ? error.response.data : error.message);
    }
};

testAuth();
