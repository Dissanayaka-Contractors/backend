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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
const jobRoutes_1 = __importDefault(require("./routes/jobRoutes"));
const testimonialRoutes_1 = __importDefault(require("./routes/testimonialRoutes"));
const contactRoutes_1 = __importDefault(require("./routes/contactRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const applicationRoutes_1 = __importDefault(require("./routes/applicationRoutes"));
const path_1 = __importDefault(require("path"));
app.use('/api/jobs', jobRoutes_1.default);
app.use('/api/testimonials', testimonialRoutes_1.default);
app.use('/api/contact', contactRoutes_1.default);
app.use('/api/auth', authRoutes_1.default);
app.use('/api/applications', applicationRoutes_1.default);
// Serve uploaded files statically
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Test Route
app.get('/api/health', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connection = yield db_1.default.getConnection();
        connection.release();
        res.json({ status: 'ok', database: 'connected' });
    }
    catch (error) {
        console.error('Database connection failed:', error);
        res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
    }
}));
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
