const db = require('../db/db');

const JobModel = {
  // 查询所有岗位（支持筛选）
  findAll: async (filters = {}) => {
    let sql = 'SELECT * FROM jobs WHERE 1=1';
    const params = [];

    if (filters.city) {
      sql += ' AND city = ?';
      params.push(filters.city);
    }
    if (filters.job_type) {
      sql += ' AND job_type = ?';
      params.push(filters.job_type);
    }
    if (filters.keyword) {
      sql += ' AND (job_title LIKE ? OR company_name LIKE ?)';
      params.push(`%${filters.keyword}%`, `%${filters.keyword}%`);
    }
    if (filters.status !== undefined) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }

    sql += ' ORDER BY created_at DESC';

    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(Number(filters.limit));
    }

    const [rows] = await db.query(sql, params);
    return rows;
  },

  // 根据 ID 查询岗位
  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM jobs WHERE id = ?', [id]);
    return rows[0];
  },

  // 创建岗位
  create: async (jobData) => {
    const {
      company_name, company_logo, company_size, company_type, company_desc,
      job_title, job_type, job_category, city,
      salary_min, salary_max, degree_required, experience,
      job_description, job_requirements, benefits, tags, link,
      headcount, status
    } = jobData;
    const [result] = await db.query(
      `INSERT INTO jobs (company_name, company_logo, company_size, company_type, company_desc,
        job_title, job_type, job_category, city,
        salary_min, salary_max, degree_required, experience,
        job_description, job_requirements, benefits, tags, link,
        headcount, status, publish_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), NOW(), NOW())`,
      [company_name, company_logo, company_size, company_type, company_desc,
       job_title, job_type, job_category, city,
       salary_min, salary_max, degree_required, experience,
       job_description, job_requirements, benefits, tags, link,
       headcount, status ?? 1]
    );
    return result.insertId;
  },

  // 更新岗位
  update: async (id, jobData) => {
    const excludeFields = ['id', 'created_at', 'updated_at', 'publish_date', 'deadline'];
    const filteredData = Object.entries(jobData)
      .filter(([key, value]) => value !== undefined && !excludeFields.includes(key))
      .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

    if (Object.keys(filteredData).length === 0) {
      throw new Error('没有可更新的字段');
    }

    filteredData.updated_at = new Date();
    const fields = Object.keys(filteredData).map(key => `\`${key}\` = ?`).join(', ');
    const values = [...Object.values(filteredData), id];
    const [result] = await db.query(`UPDATE jobs SET ${fields} WHERE id = ?`, values);
    return result.affectedRows;
  },

  // 删除岗位
  deleteJob: async (id) => {
    const [result] = await db.query('DELETE FROM jobs WHERE id = ?', [id]);
    return result.affectedRows;
  }
};

module.exports = JobModel;
