const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const { Students, Weights } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://127.0.0.1:27017/stipendia');

Weights.findOne().then(doc => {
  if (!doc) {
    const defaultWeights = new Weights();
    defaultWeights.save().then(() => console.log('Стандартные веса добавлены'));
  } else {
    console.log('Веса уже существуеют');
  } 
});

// Настройка Handlebars
const hbs = exphbs.create({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  helpers: {
    eq: function(a, b) {
      return a === b;
    },
    ne: function(a, b) {
      return a !== b;
    },
    sortUrl: function(selectedGroup, sortBy, currentSortBy, currentSortOrder) {
      let url = '?';
      if (selectedGroup && selectedGroup !== 'Все группы') {
        url += `group=${selectedGroup}&`;
      }
      const newSortOrder = (currentSortBy === sortBy && currentSortOrder === 'asc') ? 'desc' : 'asc';
      url += `sortBy=${sortBy}&sortOrder=${newSortOrder}`;
      return url;
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

app.get('/students', async (req, res) => {
  const groups = await Students.distinct('group');
  const selectedGroup = req.query.group;
  const sortBy = req.query.sortBy || 'name';
  const sortOrder = req.query.sortOrder || 'asc';
  const totalStudentsCount = await Students.countDocuments({});
  const search = req.query.search || '';

  const query = {};
  if (selectedGroup && selectedGroup !== 'Все группы') {
    query.group = selectedGroup;
  }  
  if(search !== ''){
    query.name = {$regex: search, $options: 'i'}
  }

  const sortDirection = sortOrder === 'desc' ? -1 : 1;
  const sortOptions = {};
  sortOptions[sortBy] = sortDirection;

  const students = await Students.find(query).sort(sortOptions).limit(15);

  const weights = await Weights.findOne();
  students.forEach(student => {countScore(student, weights)});

  if (sortBy === 'total_score') {
    const dir = sortOrder === 'desc' ? -1 : 1;
    students.sort((a, b) => (a.total_score - b.total_score) * dir);
  }

  res.render('pages/students', {
    totalStudentsCount,
    title: 'Студенты',
    activeTab: 'students',
    selectedGroup: selectedGroup || 'Все группы',
    sortBy,
    sortOrder,
    search,
    groups: groups.map(group => ({
      group,
    })),
    students: students.map(student => ({
      id: student._id,
      group: student.group,
      name: student.name,
      academic_score: student.academic_score,
      scientific_score: student.scientific_score,
      creative_score: student.creative_score,
      sports_score: student.sports_score,
      social_score: student.social_score,
      total_score: student.total_score,
    })),
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

app.get('/settings', async (req, res) => {
  const weights = await Weights.findOne().lean();
  res.render('pages/settings', {
    title: 'Настройки',
    activeTab: 'settings',
    weights,
  });
});

app.post('/settings', async (req, res) => {
  const weightsData = req.body;
  let weights = await Weights.updateOne({}, {
    a_student: [Number(weightsData.a_student_yes), Number(weightsData.a_student_no)],
    olimpiads: {
      Int: { first: Number(weightsData.olimpiads_int_first), second: Number(weightsData.olimpiads_int_second), third: Number(weightsData.olimpiads_int_third) },
      Rus: { first: Number(weightsData.olimpiads_rus_first), second: Number(weightsData.olimpiads_rus_second), third: Number(weightsData.olimpiads_rus_third) },
      Uni: { first: Number(weightsData.olimpiads_uni_first), second: Number(weightsData.olimpiads_uni_second), third: Number(weightsData.olimpiads_uni_third) }
    },
    ed_programms: Number(weightsData.ed_programms),
    research_contests: {
      Int: { first: Number(weightsData.research_contests_int_first), second: Number(weightsData.research_contests_int_second), third: Number(weightsData.research_contests_int_third) },
      Rus: { first: Number(weightsData.research_contests_rus_first), second: Number(weightsData.research_contests_rus_second), third: Number(weightsData.research_contests_rus_third) },
      Uni: { first: Number(weightsData.research_contests_uni_first), second: Number(weightsData.research_contests_uni_second), third: Number(weightsData.research_contests_uni_third) }
    },
    publications: [Number(weightsData.publications_vak), Number(weightsData.publications_other)],
    reports: Number(weightsData.reports),
    create_contests: {
      Int: { first: Number(weightsData.create_contests_int_first), second: Number(weightsData.create_contests_int_second), third: Number(weightsData.create_contests_int_third) },
      Rus: { first: Number(weightsData.create_contests_rus_first), second: Number(weightsData.create_contests_rus_second), third: Number(weightsData.create_contests_rus_third) },
      Uni: { first: Number(weightsData.create_contests_uni_first), second: Number(weightsData.create_contests_uni_second), third: Number(weightsData.create_contests_uni_third) }
    },
    sports_titles: [Number(weightsData.sports_titles_master), Number(weightsData.sports_titles_candidate)],
    sports_championships: {
      Int: Number(weightsData.sports_championships_Int),
      Rus: Number(weightsData.sports_championships_Rus),
      CFO: Number(weightsData.sports_championships_CFO),
      Regional: Number(weightsData.sports_championships_Regional),
      other: Number(weightsData.sports_championships_other)
    },
    sports_popularization: Number(weightsData.sports_popularization),
    starosta: Number(weightsData.starosta),
    profsoyuz: Number(weightsData.profsoyuz),
    volunteer: Number(weightsData.volunteer),
    cultural_events: Number(weightsData.cultural_events)
  });
  res.redirect('/settings');
});

app.get('/portfolio', async (req, res) => {
  const studentId = req.query.id;
  const student = await Students.findById(studentId).lean();
  const weights = await Weights.findOne();
  countScore(student, weights)
  

  console.log(student);
  
  res.render('pages/portfolio', {
    title: 'Портфолио',
    activeTab: '',
    student,
  });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});


function calculateContestScore(contests, contest_type, weights) {
  let score = 0;
  contests.forEach(contest => {
    if (weights[contest_type][contest.pType]) {
      switch (contest.place) {
        case 1:
          score += weights[contest_type][contest.pType].first;
          break;
        case 2:
          score += weights[contest_type][contest.pType].second;
          break;
        case 3:
          score += weights[contest_type][contest.pType].third;
          break;
      }
    }
  });
  return score;
}

function countScore(student, weights) {
  student.academic_score = (() => {
      let score = 0;
      score += student.a_student ? weights.a_student[0] : weights.a_student[1];
      score += calculateContestScore(student.olimpiads, 'olimpiads', weights);
      score += (student.ed_programms || 0) * weights.ed_programms;
      return score;
    })();
    student.scientific_score = (() => {
      let score = 0;
      score += calculateContestScore(student.research_contests, 'research_contests', weights);
      student.publications.forEach(pub => {
        score += pub.rank ? weights.publications[0] : weights.publications[1];
      });
      score += (student.reports || 0) * weights.reports;
      return score;
    })();
    student.creative_score = (() => {
      let score = 0;
      score += calculateContestScore(student.create_contests, 'create_contests', weights);
      return score;
    })();
    student.sports_score = (() => {
      let score = 0;
      if (student.sports_titles[0]) {
        score += weights.sports_titles[0];
      }
      if (student.sports_titles[1]) {
        score += weights.sports_titles[1];
      }
      student.sports_championships.forEach(champ => {
        score += champ.place === 1 ? weights.sports_championships[champ.pType] : weights.sports_championships['other'];
      });
      score += (student.sports_popularization || 0) * weights.sports_popularization;
      return score;
    })();
    student.social_score = (() => {
      let score = 0;
      score += student.starosta ? weights.starosta : 0;
      score += student.profsoyuz ? weights.profsoyuz : 0;
      score += student.volunteer ? weights.volunteer : 0;
      score += (student.cultural_events || 0) * weights.cultural_events;
      return score;
    })();
    student.total_score = student.academic_score + student.scientific_score + student.creative_score + student.sports_score + student.social_score;
}