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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const API_URL = 'http://localhost:5001/api/auth';
const testAuth = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Testing Admin Login...');
        const adminLogin = yield axios_1.default.post(`${API_URL}/login`, {
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
        const register = yield axios_1.default.post(`${API_URL}/register`, newUser);
        console.log('User Registration Success:', register.data.id ? 'User created' : 'Failed');
        console.log('\nTesting User Login...');
        const userLogin = yield axios_1.default.post(`${API_URL}/login`, {
            email: newUser.email,
            password: newUser.password
        });
        console.log('User Login Success:', userLogin.data.token ? 'Token received' : 'No token');
    }
    catch (error) {
        console.error('Auth Test Failed:', error.response ? error.response.data : error.message);
    }
});
testAuth();
