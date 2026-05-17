const express = require('express');
const WebUserRouter = express.Router();
const UserController = require('../../controllers/web/UserController');
const multer = require('multer');
const upload = multer({ dest: 'public/avataruploads/' });

WebUserRouter.post('/user/login', UserController.login);
WebUserRouter.post('/user/register', UserController.register);
WebUserRouter.get('/user/profile', UserController.getProfile);
WebUserRouter.put('/user/profile', upload.single('file'), UserController.updateProfile);
WebUserRouter.get('/user/favorites', UserController.getFavorites);
WebUserRouter.get('/user/favorite/check', UserController.checkFavorite);
WebUserRouter.post('/user/favorite', UserController.toggleFavorite);

module.exports = WebUserRouter;
