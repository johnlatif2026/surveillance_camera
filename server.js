require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// صفحة الكاميرا الرئيسية
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// صفحة Live المحمية بكلمة مرور
app.get('/live', (req, res) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.redirect('/login');
  }
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return res.sendFile(path.join(__dirname, 'live.html'));
  } catch (err) {
    return res.redirect('/login');
  }
});

// صفحة تسجيل الدخول لإدخال كلمة المرور
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// التحقق من كلمة المرور
app.post('/login', (req, res) => {
  const { password } = req.body;
  if (password === process.env.LIVE_PASSWORD) {
    const token = jwt.sign({ access: 'granted' }, process.env.JWT_SECRET, { expiresIn: '12h' });
    res.cookie('jwt', token, { httpOnly: true });
    return res.redirect('/live');
  }
  return res.send('كلمة المرور خاطئة. <a href="/login">ارجع</a>');
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
