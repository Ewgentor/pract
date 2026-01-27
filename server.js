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
  sports_titles: [ Boolean ], // [Мастер спорта, Кандидат в мастера спорта]
  sports_championships: [
    {pType:String, place: Number}
  ],
  sports_popularization: Number,
  starosta: Boolean,
  profsoyuz: Boolean,
  volunteer: Boolean,
  cultural_events: Number
}));

const Weights = mongoose.model('Weights', new mongoose.Schema({
  a_student: {type: [Number], default: [2, 1]}, // [yes, no]
  olimpiads: {
    Int: {first: {type: Number, default: 6}, second: {type: Number, default: 5}, third: {type: Number, default: 3}},
    Rus: {first: {type: Number, default: 4}, second: {type: Number, default: 3}, third: {type: Number, default: 2}},
    Uni: {first: {type: Number, default: 3}, second: {type: Number, default: 2}, third: {type: Number, default: 1}}
  },
  ed_programms: {type: Number, default: 1},
  research_contests: {
    Int: {first: {type: Number, default: 6}, second: {type: Number, default: 5}, third: {type: Number, default: 3}},
    Rus: {first: {type: Number, default: 4}, second: {type: Number, default: 3}, third: {type: Number, default: 2}},
    Uni: {first: {type: Number, default: 3}, second: {type: Number, default: 2}, third: {type: Number, default: 1}}
  },
  publications: {type: [Number], default: [3, 1]}, // [ВАК/РИНЦ, Прочее]
  reports: {type: Number, default: 1},
  create_contests: {
    Int: {first: {type: Number, default: 6}, second: {type: Number, default: 5}, third: {type: Number, default: 3}},
    Rus: {first: {type: Number, default: 4}, second: {type: Number, default: 3}, third: {type: Number, default: 2}},
    Uni: {first: {type: Number, default: 3}, second: {type: Number, default: 2}, third: {type: Number, default: 1}}
  },
  sports_title: [
    {type: Number, default: [8, 8]} // [Мастер спорта, Кандидат в мастера спорта]
  ],
  sports_championships: {
    Int: {type: Number, default: 8},
    Rus: {type: Number, default: 6},
    CFO: {type: Number, default: 5},
    Regional: {type: Number, default: 4},
    other: {type: Number, default: 4}
  },
  sports_popularization: {type: Number, default: 3},
  starosta: {type: Number, default: 2},
  profsoyuz: {type: Number, default: 2},
  volunteer: {type: Number, default: 2},
  cultural_events: {type: Number, default: 2}
}));

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
  students.forEach(student => {
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
        score += weights.sports_title[0];
      }
      if (student.sports_titles[1]) {
        score += weights.sports_title[1];
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
  });

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

app.get('/settings', (req, res) => {
  res.render('pages/settings', {
    title: 'Настройки',
    activeTab: 'settings'
  });
});

app.get('/portfolio', async (req, res) => {
  const studentId = req.query.id;
  const student = await Students.findById(studentId);

  

  console.log(student);
  
  res.render('pages/portfolio', {
    title: 'Портфолио',
    activeTab: '',
    student: {...student._doc},
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