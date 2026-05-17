const JWT = require('../util/JWT');

// 白名单：不需要 token 验证的路由
const whitelist = [
    '/adminApi/user/login',
    '/adminApi/user/register',
    '/webApi/user/login',
    '/webApi/user/register',
    '/webApi/news/list',
    '/webApi/news/detail',
    '/webApi/job/list',
    '/webApi/job/detail',
    '/api/health',
];

const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    // 白名单路由：不强制要求 token，但如果有的话仍然解析（用于记录行为）
    const pathname = req.url.split('?')[0];
    const isWhitelisted = whitelist.some(path => pathname.startsWith(path));

    if (token) {
        const payload = JWT.verify(token);
        if (payload) {
            const newToken = JWT.generate({
                id: payload.id,
                username: payload.username,
                role: payload.role
            }, '1h');
            res.header("Authorization", newToken);
            req.user = payload;
        } else if (!isWhitelisted) {
            return res.status(401).json({
                code: 401,
                message: '无效的token,请重新登录'
            });
        }
    } else if (!isWhitelisted) {
        return res.status(401).json({
            code: 401,
            message: '缺少 token, 请先登录'
        });
    }

    next();
};

module.exports = authMiddleware;