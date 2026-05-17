# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

就业服务平台 — a full-stack employment services platform with two frontends (admin + client), an Express backend, and an AI-powered RAG chatbot. Five sub-projects: `admin/`, `client/`, `server/`, `ai_service/`, `ai_tuning/`.

## Development Commands

```bash
# Admin frontend (admin/) — Vue 3 + Vite, port 5173
cd admin && npm install && npm run dev

# Client frontend (client/) — Vue 3 + Vite, port 5174
cd client && npm install && npm run dev

# Backend (server/) — Express.js via node-dev, port 3000
cd server && npm install && npm start

# AI Service (ai_service/) — FastAPI + ChromaDB, port 8000
cd ai_service && source venv/bin/activate && python main.py

# Database initialization (MySQL)
cd server && node init-database.js   # Runs init-db.sql

# AI fine-tuning (ai_tuning/)
cd ai_tuning && python train.py      # LoRA fine-tune Qwen-1.8B-Chat
cd ai_tuning && python merge_lora.py # Merge LoRA → merged_model/
```

Python 3.10 (`.python-version`). Node not pinned.

## Architecture

### Request Flow

```
Admin (5173) ──┐
               ├─ /adminApi/*  → Express (3000) → MySQL
               ├─ /webApi/*    → Express (3000) → MySQL
               ├─ /avataruploads/*, /newsuploads/* → Express static files
               └─ /api/*       → FastAPI (8000) → ChromaDB + Qwen

Client (5174) ─┘  (same proxy rules)
```

Both Vite dev servers proxy API requests to Express (3000) and FastAPI (8000). See `admin/vite.config.js` and `client/vite.config.js`.

### server/ — Express.js Backend

- **MVC**: `routes/` → `controllers/` → `services/` → `models/`
- **Route groups**: `/adminApi/*` (admin CRUD), `/webApi/*` (client-facing), `/api/*` (AI proxy)
- **Auth**: JWT (`middlewares/authMiddleware.js`) — all routes except `POST /adminApi/user/login`. Header: `Authorization: Bearer <token>`. Token refreshes on each request (1h expiry).
- **DB**: MySQL via `mysql2` pool (`server/db/db.js`). Database: `employment_platform`. Tables: `users`, `news`, `jobs`, `user_behaviors`, `favorites`.
- **Roles**: `users.role` — 0 = 毕业生 (student), 1 = 管理员 (admin)
- **Uploads**: `multer` → `public/avataruploads/` (avatars), `public/newsuploads/` (news covers)

### admin/ — Admin Frontend (Vue 3)

- Vue 3 + Vite + Element Plus + Pinia (persisted state)
- Dynamic routes injected in `router.beforeEach` guard (`router/index.js`). Routes from `router/config.js` wrapped in `Mainbox` layout. `requiresAdmin: true` routes only added for role=1.
- Pinia stores: `store/global.js` (router init flag), `store/userInfo.js` (user + token), `store/collapse.js` (sidebar)
- Views: Login, Home, Center (profile), user/news/job CRUD, NotFound

### client/ — Client Frontend (Vue 3)

- Same stack as admin, runs on port 5174
- Views: Home, Login, JobList, JobDetail, NewsList, NewsDetail, Favorites, Profile
- Has its own `ChatBot.vue` component (AI assistant floating widget)

### ai_service/ — Python AI Service (FastAPI)

- **RAG pipeline**: question → ChromaDB vector search (top 3, cosine) → context in prompt → Qwen model generates answer
- **Model**: LoRA-merged Qwen from `ai_tuning/merged_model/` (absolute path hardcoded in `main.py`)
- **Vector store**: ChromaDB at `ai_service/chroma_db/`, collection `employment_knowledge`
- **Endpoints**: `POST /api/ai/chat`, `POST /api/ai/embed`, `DELETE/PUT /api/ai/document/{type}/{id}`, `GET /health`

### ai_tuning/ — Model Fine-tuning

- LoRA fine-tuning on Qwen-1.8B-Chat with employment data (21 JSONL files)
- `train.py` → `lora_model/` → `merge_lora.py` → `merged_model/`
- Uses MPS acceleration on macOS

## Key Conventions

- **Language**: UI and comments in Chinese (中文).
- **AI document IDs**: `{doc_type}_{doc_id}` format in ChromaDB (e.g., `job_1`, `news_5`).
- **Testing**: see下方「测试」章节。
- **UI design**: Use the `nothing-design` skill (`.claude/skills/frontend-design.md`) — avoid generic "AI look".

## 测试

### 运行测试

```bash
# 后端接口测试 (Jest + supertest)
cd server && npm test

# 管理端前端测试 (Vitest + @vue/test-utils)
cd admin && npm test

# 客户端前端测试 (Vitest + @vue/test-utils)
cd client && npm test

# AI 服务测试 (pytest)
cd ai_service && source venv/bin/activate && python -m pytest -v

# 端到端测试 (Playwright) — 需要先启动 server(3000) 和 client(5174)
cd e2e && npx playwright test
```

### server/ — 后端接口测试（Jest, 54 个用例）

| 测试文件 | 测试内容 |
|---------|---------|
| `test/health.test.js` | 健康检查接口 `GET /api/health` |
| `test/auth.test.js` | JWT 认证中间件：无 token 拒绝访问、过期 token 拒绝、有效 token 放行、token 自动刷新 |
| `test/web/news.test.js` | 前台新闻接口：新闻列表、按条数限制、新闻详情、不存在的新闻返回 404 |
| `test/web/job.test.js` | 前台岗位接口：岗位列表、按城市/关键词筛选、岗位详情、推荐岗位（需登录/未登录） |
| `test/web/user.test.js` | 前台用户接口：登录（成功/密码错误）、注册（成功/参数缺失）、个人信息、收藏列表、收藏检查、添加收藏 |
| `test/admin/news.test.js` | 后台新闻管理：新闻列表、按 ID 查询、按分类查询、添加新闻（成功/缺少字段）、更新新闻、删除新闻 |
| `test/admin/job.test.js` | 后台岗位管理：岗位列表、按城市/关键词筛选、添加岗位（成功/缺少字段）、更新岗位、删除岗位 |
| `test/admin/user.test.js` | 后台用户管理：用户列表（需认证/无 token 被拒）、按 ID 查询、添加用户（成功/用户名过短/密码过短）、更新用户、删除用户 |
| `test/admin/ai.test.js` | AI 聊天接口：正常聊天、缺少问题字段、AI 服务异常时返回 500 |

### admin/ — 管理端前端测试（Vitest, 88 个用例）

| 测试文件 | 测试内容 |
|---------|---------|
| `src/store/__tests__/global.test.js` | 全局状态 store：路由初始化标志的设置与重置 |
| `src/store/__tests__/userInfo.test.js` | 用户信息 store：设置/清除用户信息、token 管理 |
| `src/store/__tests__/collapse.test.js` | 侧边栏折叠 store：切换折叠状态 |
| `src/views/__tests__/Login.test.js` | 管理员登录页：页面标题、登录按钮、版本号、系统标签 |
| `src/views/__tests__/Home.test.js` | 仪表盘首页：问候语（早/中/晚）、用户名、角色、系统状态、产品列表（6 个卡片）、时间显示 |
| `src/views/__tests__/Center.test.js` | 个人中心：页面标题、用户名、角色标签、数据字段（USERNAME/ROLE/PHONE 等）、编辑表单、学历选项、未填字段破折号 |
| `src/views/__tests__/NewsList.test.js` | 新闻列表：加载数据、总数/已发布统计、分类筛选（5 个分类）、发布状态、操作按钮、空列表状态 |
| `src/views/__tests__/NewsAdd.test.js` | 创建新闻：页面标题、表单字段、分类选项（4 个）、编辑器组件、上传组件、草稿/发布按钮 |
| `src/views/__tests__/UserList.test.js` | 用户列表：加载数据、角色标签（管理员/毕业生/企业人员）、统计（总数/教师/企业/毕业生）、操作按钮、状态标签、空列表 |
| `src/views/__tests__/UserAdd.test.js` | 添加用户：页面标题、表单字段（用户名/密码/角色/手机号等）、角色选项、学历选项、上传组件 |
| `src/views/__tests__/JobAdd.test.js` | 发布岗位：页面标题、表单字段、城市/学历选项、上传组件 |
| `src/views/__tests__/JobList.test.js` | 岗位列表：加载数据、统计、分类筛选、关键字搜索、薪资显示、空列表 |
| `src/views/__tests__/NotFound.test.js` | 404 页面：错误提示、返回首页链接 |
| `src/components/__tests__/TopHeader.test.js` | 顶部导航栏：品牌名称、用户名、角色标签、在线状态、时间、折叠按钮、下拉菜单（个人中心/退出登录） |
| `src/components/__tests__/SideMenu.test.js` | 侧边菜单：Logo、版本号、一级菜单（首页/个人中心/用户管理/新闻管理/岗位管理）、子菜单项 |

### client/ — 客户端前端测试（Vitest, 85 个用例）

| 测试文件 | 测试内容 |
|---------|---------|
| `src/store/__tests__/global.test.js` | 全局状态 store：路由初始化标志 |
| `src/store/__tests__/userInfo.test.js` | 用户信息 store：设置/清除用户信息、token 管理、updateInfo 部分更新 |
| `src/util/__tests__/axios.config.test.js` | Axios 配置：请求拦截器添加 token、响应拦截器处理 401 跳转登录 |
| `src/views/__tests__/Login.test.js` | 登录页：页面标题、登录按钮、切换注册模式、注册表单字段 |
| `src/views/__tests__/Home.test.js` | 首页：标题文字、导航按钮、推荐岗位（卡片/薪资）、最新资讯、统计数据、空状态、ChatBot 组件 |
| `src/views/__tests__/JobList.test.js` | 岗位列表：加载数据、结果数量、类型筛选、关键字搜索、薪资显示、空状态 |
| `src/views/__tests__/JobDetail.test.js` | 岗位详情：标题、薪资、公司信息（名称/类型/规模/简介）、岗位信息（城市/学历/经验）、描述/要求/福利、标签、投递按钮、收藏按钮、加载状态 |
| `src/views/__tests__/NewsList.test.js` | 新闻列表：加载数据、结果数量、分类筛选、日期格式化、浏览量、空状态 |
| `src/views/__tests__/NewsDetail.test.js` | 新闻详情：标题、分类、日期、浏览量、封面图片、内容渲染、标签、收藏按钮、返回链接、加载状态 |
| `src/views/__tests__/Favorites.test.js` | 收藏页面：加载收藏列表、空收藏状态 |
| `src/views/__tests__/Profile.test.js` | 个人中心：页面标题、头像首字母（中文/英文）、用户名和姓名、专业和学校、数据字段标签、未填字段破折号、简历编辑入口 |
| `src/components/__tests__/Navbar.test.js` | 导航栏：品牌名称、导航链接、用户登录状态显示 |

### ai_service/ — AI 服务测试（pytest, 12 个用例）

| 测试文件 | 测试内容 |
|---------|---------|
| `test_main.py` | 健康检查（`/` 和 `/health`）、文档嵌入（正常/无元数据/缺少字段）、AI 聊天（有上下文/有历史/空问题）、删除文档（普通/新闻）、更新文档（普通/带元数据） |

### e2e/ — 端到端测试（Playwright, 5 个场景）

| 测试文件 | 测试内容 |
|---------|---------|
| `tests/auth.setup.js` | 登录认证 setup：保存登录状态供后续测试复用 |
| `tests/login.spec.js` | 登录流程：输入账号密码、提交表单、验证跳转 |
| `tests/navigation.spec.js` | 页面导航：首页 → 岗位列表 → 新闻列表，验证各页面关键元素 |
| `tests/job-browse.spec.js` | 岗位浏览：查看岗位列表、点击进入详情页、验证详情内容 |
| `tests/news-browse.spec.js` | 新闻浏览：查看新闻列表、点击进入详情页、验证详情内容 |
| `tests/favorites.spec.js` | 收藏功能：收藏/取消收藏岗位、验证收藏列表 |
