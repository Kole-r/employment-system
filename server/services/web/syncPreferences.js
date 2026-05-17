const db = require('../../db/db');

/**
 * 行为记录时自动同步用户意向城市和意向岗位
 * 将岗位的城市和类型追加到用户偏好中（如不存在）
 */
async function syncUserPreferences(userId, city, jobType) {
    const fields = [];
    const values = [];

    if (city) {
        const [rows] = await db.query('SELECT city_preference FROM users WHERE id = ?', [userId]);
        const current = rows[0]?.city_preference || '';
        const list = current.split(',').filter(Boolean);
        if (!list.includes(city)) {
            list.push(city);
            fields.push('city_preference = ?');
            values.push(list.join(','));
        }
    }

    if (jobType) {
        const [rows] = await db.query('SELECT job_preference FROM users WHERE id = ?', [userId]);
        const current = rows[0]?.job_preference || '';
        const list = current.split(',').filter(Boolean);
        if (!list.includes(jobType)) {
            list.push(jobType);
            fields.push('job_preference = ?');
            values.push(list.join(','));
        }
    }

    if (fields.length > 0) {
        values.push(userId);
        await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    }
}

module.exports = syncUserPreferences;
