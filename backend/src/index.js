const express = require('express');
const cors = require('cors');
const session = require('express-session');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3000;

// 使用 JSON 文件作为数据库
const adapter = new FileSync('db.json');
const db = low(adapter);

// 配置 session
app.use(session({
  secret: 'prompt-hub-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // 开发环境使用 http
    maxAge: 24 * 60 * 60 * 1000 // 24小时
  }
}));

// 配置 CORS
app.use(cors({
  origin: 'http://localhost:5173', // 前端地址
  credentials: true // 允许携带凭证
}));

app.use(express.json());

// 初始化数据库结构
db.defaults({ prompts: [], categories: [], admin: { password: 'admin123' } }).write();

// 验证管理员中间件
const checkAdmin = (req, res, next) => {
  if (req.session.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: '未授权' });
  }
};

// 管理员登录
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const adminPassword = db.get('admin.password').value();
  
  if (password === adminPassword) {
    req.session.isAdmin = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ message: '密码错误' });
  }
});

// 检查管理员登录状态
app.get('/api/admin/check', (req, res) => {
  res.json({ isAdmin: !!req.session.isAdmin });
});

// 管理员登出
app.post('/api/admin/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// 获取所有分类
app.get('/api/categories', (req, res) => {
  const categories = db.get('categories').value();
  res.json(categories);
});

// 获取所有提示词
app.get('/api/prompts', (req, res) => {
  const prompts = db.get('prompts').value();
  res.json(prompts);
});

// 获取单个提示词
app.get('/api/prompts/:id', (req, res) => {
  const { id } = req.params;
  const prompt = db.get('prompts').find({ id }).value();
  if (!prompt) {
    return res.status(404).json({ message: '提示词不存在' });
  }
  const category = db.get('categories').find({ id: prompt.categoryId }).value();
  res.json({ ...prompt, category });
});

// 创建提示词
app.post('/api/prompts', checkAdmin, (req, res) => {
  try {
    const { model, content, usage, categoryId, source } = req.body;
    if (!model || !content) {
      return res.status(400).json({ message: '提示词名称和内容不能为空' });
    }

    const prompt = {
      id: uuidv4(),
      model,
      content,
      usage,
      categoryId,
      source,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    };

    db.get('prompts').push(prompt).write();
    res.status(201).json(prompt);
  } catch (error) {
    res.status(500).json({ message: '创建失败' });
  }
});

// 更新提示词
app.put('/api/prompts/:id', checkAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { model, content, usage, categoryId, source } = req.body;
    if (!model || !content) {
      return res.status(400).json({ message: '提示词名称和内容不能为空' });
    }

    const prompt = db.get('prompts').find({ id }).value();
    if (!prompt) {
      return res.status(404).json({ message: '提示词不存在' });
    }

    prompt.model = model;
    prompt.content = content;
    prompt.usage = usage;
    prompt.categoryId = categoryId;
    prompt.source = source;
    prompt.updateTime = new Date().toISOString();

    db.write();
    res.json(prompt);
  } catch (error) {
    res.status(500).json({ message: '更新失败' });
  }
});

// 删除提示词
app.delete('/api/prompts/:id', checkAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const prompt = db.get('prompts').find({ id }).value();
    if (!prompt) {
      return res.status(404).json({ message: '提示词不存在' });
    }

    db.get('prompts').remove({ id }).write();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: '删除失败' });
  }
});

// 创建分类
app.post('/api/categories', checkAdmin, (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: '分类名称不能为空' });
    }

    const category = {
      id: uuidv4(),
      name,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    };

    db.get('categories').push(category).write();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: '创建失败' });
  }
});

// 更新分类
app.put('/api/categories/:id', checkAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: '分类名称不能为空' });
    }

    const category = db.get('categories').find({ id }).value();
    if (!category) {
      return res.status(404).json({ message: '分类不存在' });
    }

    category.name = name;
    category.updateTime = new Date().toISOString();

    db.write();
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: '更新失败' });
  }
});

// 删除分类
app.delete('/api/categories/:id', checkAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const category = db.get('categories').find({ id }).value();
    if (!category) {
      return res.status(404).json({ message: '分类不存在' });
    }

    // 检查是否有提示词使用此分类
    const hasPrompts = db.get('prompts').find({ categoryId: id }).value();
    if (hasPrompts) {
      return res.status(400).json({ message: '该分类下还有提示词，无法删除' });
    }

    db.get('categories').remove({ id }).write();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: '删除失败' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
}); 