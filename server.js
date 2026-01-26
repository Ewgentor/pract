const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const { type } = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://127.0.0.1:27017/stipendia');

const Students = mongoose.model('Students', new mongoose.Schema({
  group: String,
  name: String,
  a_student: Boolean,
  olimpiads: [
    {pType: String, place: Number}
  ],
  ed_programms: Number,
  research_contests: [
    {pType: String, place: Number}
  ],
  publications: [
    {rank: Boolean}
  ],
  reports: Number,
  create_contests: [
    {pType: String, place: Number}
  ],
  sports_title: String,
  sports_championships: [
    {pType:String, place: Number}
  ],
  sports_popularization: Number,
  starosta: Boolean,
  profsoyuz: Boolean,
  volunteer: Boolean,
  cultural_events: Number
}));

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
