const jsonwebtoken = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'test-secret'
const JWT = {
    generate(value, exprires) {//生成token
        return jsonwebtoken.sign(value, secret, { expiresIn: exprires });
    },
    verify(token) {//验证token
        try {
            return jsonwebtoken.verify(token, secret);//返回解码后的值
        } catch (error) {
            console.error('JWT verify failed:', error.message);
            return false;
        }
    }
}
module.exports = JWT;