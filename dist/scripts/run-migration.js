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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const db_1 = __importDefault(require("../config/db"));
const migrate = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sqlPath = path_1.default.join(__dirname, '../../migrations/add_cv_blob.sql');
        const sql = fs_1.default.readFileSync(sqlPath, 'utf8');
        const queries = sql.split(';').filter(q => q.trim().length > 0);
        const connection = yield db_1.default.getConnection();
        console.log("Connected to database. Running migration...");
        for (const query of queries) {
            try {
                yield connection.query(query);
                console.log(`Executed: ${query.trim()}`);
            }
            catch (err) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log("Column already exists, skipping.");
                }
                else {
                    console.error("Error executing query:", err);
                }
            }
        }
        connection.release();
        console.log("Migration complete.");
        process.exit(0);
    }
    catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
});
migrate();
