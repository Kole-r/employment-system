const db = require('../../db/db');

const RecommendService = {
  // 基于用户行为和画像的岗位推荐
  getRecommendJobs: async (userId, limit = 10) => {
    // 1. 获取用户画像
    const [userRows] = await db.query(
      'SELECT major, degree, city_preference, job_preference FROM users WHERE id = ?',
      [userId]
    );
    const user = userRows[0];
    if (!user) return [];

    // 2. 获取用户行为（浏览/收藏的岗位）
    const [behaviors] = await db.query(
      `SELECT target_id, behavior, duration FROM user_behaviors
       WHERE user_id = ? AND target_type = 'job'
       ORDER BY created_at DESC LIMIT 50`,
      [userId]
    );

    // 3. 收集已浏览岗位 ID（用于排除），并单独记录收藏岗位
    const viewedJobIds = new Set();
    const favoritedJobIds = new Set();
    behaviors.forEach(b => {
      viewedJobIds.add(b.target_id);
      if (b.behavior === 'collect') favoritedJobIds.add(b.target_id);
    });

    // 4. 用户偏好（行为已自动同步到 profile，直接使用）
    let preferredCities = user.city_preference ? user.city_preference.split(',') : [];
    let preferredTypes = user.job_preference ? user.job_preference.split(',') : [];
    let preferredTags = [];
    let favoritedJobTypes = new Set();
    let favoritedTags = new Set();

    // 从已浏览岗位中提取标签偏好（标签不存储在 profile 中）
    if (viewedJobIds.size > 0) {
      const ids = [...viewedJobIds];
      const [viewedJobs] = await db.query(
        `SELECT id, job_type, tags FROM jobs WHERE id IN (${ids.map(() => '?').join(',')})`,
        ids
      );
      viewedJobs.forEach(j => {
        if (j.tags) {
          j.tags.split(',').forEach(t => {
            const tag = t.trim();
            if (tag && !preferredTags.includes(tag)) preferredTags.push(tag);
          });
        }
        // 收藏岗位的类型和标签单独收集
        if (favoritedJobIds.has(j.id)) {
          if (j.job_type) favoritedJobTypes.add(j.job_type);
          if (j.tags) {
            j.tags.split(',').forEach(t => {
              const tag = t.trim();
              if (tag) favoritedTags.add(tag);
            });
          }
        }
      });
    }

    // 5. 获取所有招聘中的岗位（排除已浏览的）
    let sql = 'SELECT * FROM jobs WHERE status = 1';
    const params = [];
    if (viewedJobIds.size > 0) {
      sql += ` AND id NOT IN (${[...viewedJobIds].map(() => '?').join(',')})`;
      params.push(...viewedJobIds);
    }
    const [candidates] = await db.query(sql, params);

    // 6. 对候选岗位打分
    const scored = candidates.map(job => {
      let score = 0;

      // 城市匹配
      if (preferredCities.includes(job.city)) score += 3;

      // 岗位类型匹配
      if (preferredTypes.includes(job.job_type)) score += 4;

      // 标签匹配
      if (job.tags) {
        const jobTags = job.tags.split(',').map(t => t.trim());
        jobTags.forEach(t => {
          if (preferredTags.includes(t)) score += 2;
        });
      }

      // 收藏行为加权：与收藏岗位同类型或同标签加分
      if (favoritedJobTypes.has(job.job_type)) score += 3;
      if (job.tags) {
        job.tags.split(',').forEach(t => {
          const tag = t.trim();
          if (tag && favoritedTags.has(tag)) score += 3;
        });
      }

      // 学历匹配
      if (user.degree === job.degree_required) score += 1;

      // 专业相关性（简单关键词匹配）
      if (user.major && job.job_title) {
        const majorKeywords = {
          '计算机': ['前端', '后端', '开发', '软件', '算法', '数据'],
          '软件': ['前端', '后端', '开发', '软件', '测试'],
          '金融': ['金融', '财务', '风控', '运营'],
          '设计': ['UI', 'UX', '设计', '视觉'],
          '电子': ['嵌入式', '硬件', '电子', '通信'],
          '通信': ['通信', '嵌入式', '网络'],
        };
        Object.entries(majorKeywords).forEach(([key, keywords]) => {
          if (user.major.includes(key)) {
            keywords.forEach(kw => {
              if (job.job_title.includes(kw)) score += 2;
            });
          }
        });
      }

      return { ...job, score };
    });

    // 7. 排序并返回
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit);
  }
};

module.exports = RecommendService;
