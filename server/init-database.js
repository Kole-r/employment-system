const db = require('./db/db');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
    try {
        console.log('开始初始化数据库...');

        // 读取 init-db.sql 并逐条执行
        const sql = fs.readFileSync(path.join(__dirname, 'init-db.sql'), 'utf8');
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        for (const stmt of statements) {
            await db.execute(stmt);
        }
        console.log('数据表创建完成');

        // 检查是否已有管理员数据
        const [existingUsers] = await db.query('SELECT COUNT(*) as count FROM users');
        if (existingUsers[0].count === 0) {
            // 插入默认管理员
            const adminPwd = process.env.ADMIN_PASSWORD || '123456';
            await db.execute(`
                INSERT INTO users (username, password, role, real_name, phone, email, status)
                VALUES ('admin', ?, 1, '系统管理员', '13800000000', 'admin@employment.com', 1)
            `, [adminPwd]);
            console.log('默认管理员创建成功');
        } else {
            console.log('数据库中已有用户数据，跳过插入');
        }

        const [users] = await db.query('SELECT id, username, role, real_name FROM users');
        console.log('现有用户：', users);
        console.log('\n数据库初始化完成！');
        console.log('管理员登录 - 用户名: admin, 密码: 123456');

    } catch (error) {
        console.error('数据库初始化失败:', error);
    } finally {
        process.exit(0);
    }
}

initDatabase();
