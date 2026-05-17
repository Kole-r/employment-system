const express = require('express');
const UserRouter = express.Router();
const UserController = require('../../controllers/admin/UserController');
// 处理文件上传
const multer = require('multer')
const upload = multer({ dest: 'public/avataruploads/' })

// 用户路由
UserRouter.post("/user/login", UserController.login);// 登录接口
UserRouter.post("/user/register", UserController.register);// 注册接口
UserRouter.post("/user/upload", upload.single('file'), UserController.upload);// 上传头像接口
UserRouter.post("/user/add", upload.single('file'), UserController.addUser);// 添加用户接口
UserRouter.get("/user/list", UserController.getUser);// 用户列表接口
UserRouter.get("/user/list/:id", UserController.getUser);// 获取单个用户接口
UserRouter.put("/user/list/:id", upload.single('file'), UserController.editUser);// 更新用户接口
UserRouter.delete("/user/delete/:id", UserController.deleteUser);// 删除用户接口
module.exports = UserRouter;
