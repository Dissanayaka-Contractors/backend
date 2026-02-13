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
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connection = yield promise_1.default.createConnection({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            multipleStatements: true
        });
        console.log('Connected to database. Running migration...');
        // Check if columns exist first to avoid errors
        try {
            const [rows] = yield connection.query("SHOW COLUMNS FROM users LIKE 'is_verified'");
            if (rows.length > 0) {
                console.log('Column is_verified already exists. Skipping migration.');
                yield connection.end();
                return;
            }
        }
        catch (e) {
            console.log('Table might not exist or other error, proceeding to try migration');
        }
        const sql = fs_1.default.readFileSync(path_1.default.join(__dirname, '../../migrations/add_user_verification.sql'), 'utf8');
        yield connection.query(sql);
        console.log('Migration completed successfully!');
        yield connection.end();
    }
    catch (error) {
        console.error('Migration failed:', error);
    }
});
run();
