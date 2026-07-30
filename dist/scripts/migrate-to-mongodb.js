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
const mongodb_1 = require("mongodb");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load env vars
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const MONGODB_URI = 'mongodb+srv://dasunthathsara974_db_user:DGfgfkjRKYK3543367khswy67@cluster0.vbanwih.mongodb.net/?appName=Cluster0';
const MONGODB_DB_NAME = 'dissanayaka_contractors';
function migrate() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Starting migration...');
        // Connect to MySQL
        const mysqlConnection = yield promise_1.default.createConnection({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });
        console.log('Connected to MySQL');
        // Connect to MongoDB
        const mongoClient = new mongodb_1.MongoClient(MONGODB_URI);
        yield mongoClient.connect();
        const mongoDb = mongoClient.db(MONGODB_DB_NAME);
        console.log('Connected to MongoDB');
        try {
            const tables = ['jobs', 'testimonials', 'contacts', 'users', 'applications'];
            for (const table of tables) {
                console.log(`Migrating table: ${table}...`);
                // Fetch data from MySQL
                const [rows] = yield mysqlConnection.execute(`SELECT * FROM ${table}`);
                const data = rows;
                if (data.length > 0) {
                    // We will insert data into a MongoDB collection with the same name
                    const collection = mongoDb.collection(table);
                    // Optionally map data if needed. E.g. converting `id` to `mysql_id` or similar.
                    // We will keep the original `id` for reference.
                    // Parse JSON for jobs keywords
                    if (table === 'jobs') {
                        for (const row of data) {
                            if (typeof row.keywords === 'string') {
                                try {
                                    row.keywords = JSON.parse(row.keywords);
                                }
                                catch (e) {
                                    // ignore
                                }
                            }
                        }
                    }
                    yield collection.insertMany(data);
                    console.log(`Migrated ${data.length} records to collection: ${table}`);
                }
                else {
                    console.log(`Table ${table} is empty.`);
                }
            }
            console.log('Migration completed successfully.');
        }
        catch (error) {
            console.error('Migration failed:', error);
        }
        finally {
            yield mysqlConnection.end();
            yield mongoClient.close();
        }
    });
}
migrate();
