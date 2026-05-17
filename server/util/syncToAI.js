const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// 复用 init_knowledge.py 的 job_to_text 格式
function jobToText(job) {
  let text = `${job.company_name}招聘${job.job_title}，工作地点${job.city}`;

  if (job.salary_min && job.salary_max) {
    text += `，薪资${job.salary_min}-${job.salary_max}元`;
  }

  text += `，要求${job.degree_required || '不限'}学历`;

  if (job.experience) {
    text += `，需要${job.experience}经验`;
  }

  if (job.benefits) {
    text += `，福利待遇包括${job.benefits}`;
  }

  text += `。岗位类型：${job.job_type || '全职'}`;

  if (job.job_category) {
    text += `，岗位分类：${job.job_category}`;
  }

  text += '。';

  if (job.job_description) {
    text += `岗位职责：${job.job_description}`;
  }

  if (job.job_requirements) {
    text += `任职要求：${job.job_requirements}`;
  }

  if (job.tags) {
    text += `标签：${job.tags}`;
  }

  return text;
}

// 复用 init_knowledge.py 的 news_to_text 格式
function newsToText(news) {
  let content = news.content || '';
  // 去除HTML标签
  content = content.replace(/<[^>]+>/g, '');
  // 截取前500字符
  if (content.length > 500) {
    content = content.substring(0, 500) + '...';
  }
  return `就业新闻：${news.title}。${content}`;
}

// 嵌入岗位到 ChromaDB
function embedJob(job) {
  const content = jobToText(job);
  return axios.post(`${AI_SERVICE_URL}/api/ai/embed`, {
    doc_type: 'job',
    doc_id: job.id,
    content,
    metadata: {
      company: job.company_name,
      title: job.job_title,
    },
  }).catch(err => {
    console.error(`[syncToAI] 岗位 ${job.id} 同步失败:`, err.message);
  });
}

// 嵌入新闻到 ChromaDB
function embedNews(news) {
  const content = newsToText(news);
  return axios.post(`${AI_SERVICE_URL}/api/ai/embed`, {
    doc_type: 'news',
    doc_id: news.id,
    content,
    metadata: {
      title: news.title,
    },
  }).catch(err => {
    console.error(`[syncToAI] 新闻 ${news.id} 同步失败:`, err.message);
  });
}

// 从 ChromaDB 删除文档
function deleteDocument(type, id) {
  return axios.delete(`${AI_SERVICE_URL}/api/ai/document/${type}/${id}`)
    .catch(err => {
      console.error(`[syncToAI] 删除 ${type}_${id} 失败:`, err.message);
    });
}

module.exports = { embedJob, embedNews, deleteDocument };
