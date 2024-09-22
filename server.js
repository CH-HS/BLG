const mongoose = require('mongoose');

const mongodbUri = process.env.MONGODB_URI;
const mongodbDb = process.env.MONGODB_DB;

mongoose.connect(mongodbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: mongodbDb,
});

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// 连接到 MongoDB （新版MongoDB连接字符串中不再需要useNewUrlParser或useUnifiedTopology）  
mongoose.connect('mongodb://localhost/balloon_game'); // 使用默认配置  

// 用户模型  
const User = mongoose.model('User', {
    account: String,
    password: String,
    highScore: Number
});

// 注册路由  
app.post('/register', async (req, res) => {
    try {
        const { account, password } = req.body;
        const existingUser = await User.findOne({ account });
        if (existingUser) {
            return res.status(400).json({ message: '账号已存在' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ account, password: hashedPassword, highScore: 0 });
        await user.save();
        res.status(201).json({ message: '注册成功' });
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

// 登录路由  
app.post('/login', async (req, res) => {
    try {
        const { account, password } = req.body;
        const user = await User.findOne({ account });
        if (!user) {
            return res.status(400).json({ message: '账号不存在' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: '密码错误' });
        }
        res.json({ message: '登录成功', highScore: user.highScore });
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

// 更新高分路由  
app.post('/updateScore', async (req, res) => {
    try {
        const { account, score } = req.body;
        const user = await User.findOne({ account });
        if (!user) {
            return res.status(400).json({ message: '用户不存在' });
        }
        if (score > user.highScore) {
            user.highScore = score;
            await user.save();
        }
        res.json({ message: '分数更新成功', highScore: user.highScore });
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

// 获取排行榜路由  
app.get('/leaderboard', async (req, res) => {
    try {
        const topUsers = await User.find().sort({ highScore: -1 }).limit(5);
        res.json(topUsers.map(user => ({ account: user.account, highScore: user.highScore })));
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

require('dotenv').config();

const mongodbUri = process.env.MONGODB_URI;
const mongodbDb = process.env.MONGODB_DB;

mongoose.connect(mongodbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: mongodbDb,
});
// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});