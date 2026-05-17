const mysql = require('mysql2');

// 创建数据库连接池
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'employment_platform',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 导出连接池
module.exports = pool.promise();