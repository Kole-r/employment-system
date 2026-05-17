const axios = require('axios');

// MiMo API 配置
const MIMO_API_URL = process.env.MIMO_API_URL;
const MIMO_API_KEY = process.env.MIMO_API_KEY;


const AIController = {
  // 管理端 AI 写作辅助
  chat: async (req, res) => {
    try {
      const { prompt, type } = req.body;

      if (!prompt) {
        return res.status(400).json({ code: 400, message: '请输入提示内容' });
      }

      // 根据 type 构建系统提示
      const systemPrompts = {
        'news_topic': '你是一个专业的就业服务新闻编辑。请根据用户的需求，生成新闻选题建议。输出 3-5 个选题，每个选题包含标题和简要说明。',
        'news_expand': '你是一个专业的就业服务新闻编辑。请根据用户提供的要点，扩写成完整的新闻内容。保持专业、准确、易读。',
        'job_desc': '你是一个专业的招聘顾问。请根据用户提供的岗位信息，生成专业的岗位描述和任职要求。',
        'job_classify': '你是一个岗位分类专家。请根据用户提供的岗位信息，判断该岗位的类型（技术/产品/运营/设计）和分类（前端/后端/算法/数据等），以及建议的标签。返回 JSON 格式。',
        'general': '你是一个就业服务平台的 AI 助手，帮助管理员高效完成内容创作。'
      };

      const systemPrompt = systemPrompts[type] || systemPrompts.general;

      // MiMo API 使用 Anthropic 原生格式：system 是顶层参数，不是 message role
      const response = await axios.post(MIMO_API_URL, {
        model: 'mimo-v2.5-pro',
        system: systemPrompt,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }, {
        headers: {
          'x-api-key': MIMO_API_KEY,
          'Authorization': `Bearer ${MIMO_API_KEY}`,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        timeout: 30000
      });

      // Anthropic 格式响应：content 是数组，取 text 类型的块
      const content = response.data.content || [];
      const answer = content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('') || '未能获取回答';

      res.status(200).json({
        code: 200,
        data: { answer }
      });
    } catch (error) {
      console.error('AI 请求失败:', error.message);
      res.status(500).json({
        code: 500,
        message: 'AI 服务暂时不可用',
        error: error.message
      });
    }
  }
};

module.exports = AIController;
