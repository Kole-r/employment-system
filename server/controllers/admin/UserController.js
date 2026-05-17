const UserService = require('../../services/admin/UserService');
const JWT = require('../../util/JWT');
const UserController = {
    // 用户注册（管理员）
    register: async (req, res) => {
        try {
            const { username, password, role } = req.body;
            if (!username || username.length < 3 || username.length > 20) {
                return res.status(200).json({ code: 400, message: '用户名长度必须在3到20个字符之间' });
            }
            if (!password || password.length < 6 || password.length > 20) {
                return res.status(200).json({ code: 400, message: '密码长度必须在6到20个字符之间' });
            }
            const existing = await UserService.getUser();
            if (existing && existing.some(u => u.username === username)) {
                return res.status(200).json({ code: 400, message: '用户名已存在' });
            }
            await UserService.addUser({ username, password, role: Number(role) || 1, status: 1 });
            res.status(200).json({ code: 200, message: '注册成功' });
        } catch (error) {
            console.error('注册失败:', error);
            res.status(500).json({ code: 500, message: '服务器内部错误' });
        }
    },
    // 用户登录
    login: async (req, res) => {
        try {
            const { username, password } = req.body;
            // 1. 参数验证
            if (!username || !password) {
                return res.status(400).json({
                    code: 400,
                    message: '用户名和密码不能为空'
                });
            }

            // 2. 调用Service层查询用户（只调用一次）
            const userInfo = await UserService.login(req.body);
            // 3. 判断登录结果
            if (!userInfo) {
                return res.status(200).json({
                    code: 401,
                    message: '用户名或密码错误'
                });
            }
            // 3.1 毕业生(role=0)不能登录管理端
            if (userInfo.role === 0) {
                return res.status(200).json({
                    code: 403,
                    message: '毕业生账号无法登录管理端，请使用客户端登录'
                });
            }
            // 4. 生成JWT token
            const token = JWT.generate({
                id: userInfo.id,
                username: userInfo.username,
                role: userInfo.role
            }, '1h');
            res.header("Authorization", token);
            res.status(200).json({
                code: 200,
                message: '登录成功',
                data: {
                    id: userInfo.id,
                    username: userInfo.username,
                    role: userInfo.role,
                    real_name: userInfo.real_name || null,
                    phone: userInfo.phone || null,
                    email: userInfo.email || null,
                    avatar: userInfo.avatar || null,
                    major: userInfo.major || null,
                    degree: userInfo.degree || null,
                    graduation_year: userInfo.graduation_year || null,
                    university: userInfo.university || null,
                    city_preference: userInfo.city_preference || null,
                    job_preference: userInfo.job_preference || null,
                    bio: userInfo.bio || null,
                    status: userInfo.status
                }
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: '服务器内部错误'
            });
        }
    },
    upload: async (req, res) => {
        const { username, bio, real_name, phone, email, major, degree, graduation_year, university, city_preference, job_preference } = req.body;
        const avatar = req.file ? `/avataruploads/${req.file.filename}` : null;
        //调用server模块更新数据
        const token = req.headers['authorization']?.split(' ')[1];
        const payload = JWT.verify(token);
        //更新用户信息
        try {
            const updateData = { username, bio, real_name, phone, email, major, degree, graduation_year: graduation_year ? Number(graduation_year) : null, university, city_preference, job_preference };
            if (avatar) {
                updateData.avatar = avatar;
            }
            await UserService.update(payload.id, updateData);
            res.status(200).json({
                code: 200,
                message: '用户信息更新成功',
                data: {
                    username,
                    bio,
                    real_name,
                    phone,
                    email,
                    major,
                    degree,
                    graduation_year: graduation_year ? Number(graduation_year) : null,
                    university,
                    city_preference,
                    job_preference,
                    avatar: avatar || req.body.avatar
                }
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: '服务器内部错误'
            });
        }
    },
    // 添加用户
    addUser: async (req, res) => {
        try {
            const { username, password, role, real_name, phone, email, major, degree, graduation_year, university, city_preference, job_preference, bio, status } = req.body;
            const avatar = req.file ? `/avataruploads/${req.file.filename}` : null;

            // 参数验证
            if (!username || username.length < 3 || username.length > 20) {
                return res.status(400).json({
                    code: 400,
                    message: '用户名长度必须在3到20个字符之间'
                });
            }
            if (!password || password.length < 6 || password.length > 20) {
                return res.status(400).json({
                    code: 400,
                    message: '密码长度必须在6到20个字符之间'
                });
            }

            // 调用Service层添加用户
            await UserService.addUser({
                username,
                password,
                role: role !== undefined ? Number(role) : 0,
                real_name,
                phone,
                email,
                avatar,
                major,
                degree,
                graduation_year: graduation_year ? Number(graduation_year) : null,
                university,
                city_preference,
                job_preference,
                bio,
                status: status !== undefined ? Number(status) : 1
            });
            res.status(200).json({
                code: 200,
                message: '用户添加成功'
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: '服务器内部错误'
            });
        }
    },
    // 获取用户列表/单个数据
    getUser: async (req, res) => {
        try {
            const userId = req.params.id; // 获取路径参数中的 id
            const result = await UserService.getUser(userId);

            // 处理返回结果：如果是单个用户，转换为数组；如果是列表，直接使用
            const users = Array.isArray(result) ? result : (result ? [result] : []);

            res.status(200).json({
                code: 200,
                message: '用户列表获取成功',
                data: users.map(user => ({
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    avatar: user.avatar,
                    real_name: user.real_name,
                    phone: user.phone,
                    email: user.email,
                    major: user.major,
                    degree: user.degree,
                    graduation_year: user.graduation_year,
                    university: user.university,
                    city_preference: user.city_preference,
                    job_preference: user.job_preference,
                    bio: user.bio,
                    status: user.status,
                }))
            });
        } catch (error) {
            console.error('获取用户列表失败:', error);
            res.status(500).json({
                code: 500,
                message: '服务器内部错误',
                error: error.message
            });
        }
    },
    // 删除用户
    deleteUser: async (req, res) => {
        try {
            const userId = req.params.id;
            if (!userId) {
                return res.status(400).json({
                    code: 400,
                    message: '用户ID不能为空'
                });
            }
            await UserService.deleteUser(userId);
            res.status(200).json({
                code: 200,
                message: '用户删除成功'
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: '服务器内部错误'
            });
        }
    },
    //编辑用户
    editUser: async (req, res) => {
        try {
            const userId = req.params.id;
            const { username, password, role, real_name, phone, email, major, degree, graduation_year, university, city_preference, job_preference, bio, status } = req.body;
            const avatar = req.file ? `/avataruploads/${req.file.filename}` : (req.body.avatar || undefined);

            // 参数验证
            if (!username || username.length < 3 || username.length > 20) {
                return res.status(400).json({
                    code: 400,
                    message: '用户名长度必须在3到20个字符之间'
                });
            }
            if (password && (password.length < 6 || password.length > 20)) {
                return res.status(400).json({
                    code: 400,
                    message: '密码长度必须在6到20个字符之间'
                });
            }
            if (!userId) {
                return res.status(400).json({
                    code: 400,
                    message: '用户ID不能为空'
                });
            }

            // 构建更新数据（只更新提供的字段）
            const updateData = {};
            if ('username' in req.body && username) updateData.username = username;
            if ('password' in req.body && password) updateData.password = password;
            if ('role' in req.body && role !== undefined) updateData.role = Number(role);
            if ('real_name' in req.body) updateData.real_name = real_name || null;
            if ('phone' in req.body) updateData.phone = phone || null;
            if ('email' in req.body) updateData.email = email || null;
            if ('major' in req.body) updateData.major = major || null;
            if ('degree' in req.body) updateData.degree = degree || null;
            if ('graduation_year' in req.body) updateData.graduation_year = graduation_year ? Number(graduation_year) : null;
            if ('university' in req.body) updateData.university = university || null;
            if ('city_preference' in req.body) updateData.city_preference = city_preference || null;
            if ('job_preference' in req.body) updateData.job_preference = job_preference || null;
            if ('bio' in req.body) updateData.bio = bio || null;
            if ('status' in req.body && status !== undefined) updateData.status = Number(status);
            if (avatar !== undefined) updateData.avatar = avatar;

            // 调用Service层更新用户
            await UserService.update(userId, updateData);

            res.status(200).json({
                code: 200,
                message: '用户更新成功'
            });
        } catch (error) {
            console.error('编辑用户失败:', error);
            res.status(500).json({
                code: 500,
                message: '服务器内部错误',
                error: error.message
            });
        }
    }

};

module.exports = UserController;