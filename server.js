const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');

const app = express();
const PORT = process.env.PORT || 3000;

// Настройка Handlebars
const hbs = exphbs.create({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  helpers: {
    eq: function(a, b) {
      return a === b;
    }
  }
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Статические файлы
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Маршруты
app.get('/', (req, res) => {
  res.redirect('/dashboard');
});

app.get('/dashboard', (req, res) => {
  res.render('pages/dashboard', {
    title: 'Дашборд',
    activeTab: 'dashboard'
  });
});

app.get('/students', (req, res) => {
  res.render('pages/students', {
    title: 'Студенты',
    activeTab: 'students'
  });
});

app.get('/upload', (req, res) => {
  res.render('pages/upload', {
    title: 'Загрузка',
    activeTab: 'upload'
  });
});

app.get('/reports', (req, res) => {
  res.render('pages/reports', {
    title: 'Отчёты',
    activeTab: 'reports'
  });
});

app.get('/settings', (req, res) => {
  res.render('pages/settings', {
    title: 'Настройки',
    activeTab: 'settings'
  });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
