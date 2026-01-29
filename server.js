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
    inc: function(value) {
      return Number(value) + 1;
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

app.get('/dashboard', async (req, res) => {
  try {
    const weights = await Weights.findOne();
    const students = await Students.find();

    // Ensure fields exist to avoid runtime errors
    students.forEach(s => {
      s.olimpiads = s.olimpiads || [];
      s.research_contests = s.research_contests || [];
      s.create_contests = s.create_contests || [];
      s.publications = s.publications || [];
      s.sports_championships = s.sports_championships || [];
      s.sports_titles = s.sports_titles || [false, false];
      s.ed_programms = s.ed_programms || 0;
      s.reports = s.reports || 0;
      s.sports_popularization = s.sports_popularization || 0;
      s.cultural_events = s.cultural_events || 0;
    });

    // Calculate scores for each student
    students.forEach(student => { countScore(student, weights); });

    const totalStudents = students.length;
    const avgScore = totalStudents ? Math.round(students.reduce((acc, s) => acc + (s.total_score || 0), 0) / totalStudents) : 0;
    const groups = Array.from(new Set(students.map(s => s.group).filter(Boolean)));
    const groupsCount = groups.length;
    const maxScore = students.length ? Math.max(...students.map(s => s.total_score || 0)) : 0;

    const topStudents = students
      .slice()
      .sort((a, b) => (b.total_score || 0) - (a.total_score || 0))
      .slice(0, 10)
      .map(s => ({ id: s._id, name: s.name, group: s.group, total_score: s.total_score || 0 }));

    // Category distribution totals
    const categorySums = students.reduce((acc, s) => {
      acc.academic += s.academic_score || 0;
      acc.scientific += s.scientific_score || 0;
      acc.creative += s.creative_score || 0;
      acc.sports += s.sports_score || 0;
      acc.social += s.social_score || 0;
      return acc;
    }, { academic: 0, scientific: 0, creative: 0, sports: 0, social: 0 });

    const totalCategoryPoints = Object.values(categorySums).reduce((a, b) => a + b, 0) || 1;
    const categoryDistribution = [
      { label: 'Учебная', value: Math.round(categorySums.academic), percent: Math.round(categorySums.academic / totalCategoryPoints * 100), color: '#0d6efd' },
      { label: 'Научная', value: Math.round(categorySums.scientific), percent: Math.round(categorySums.scientific / totalCategoryPoints * 100), color: '#6f42c1' },
      { label: 'Творческая', value: Math.round(categorySums.creative), percent: Math.round(categorySums.creative / totalCategoryPoints * 100), color: '#fd7e14' },
      { label: 'Спортивная', value: Math.round(categorySums.sports), percent: Math.round(categorySums.sports / totalCategoryPoints * 100), color: '#198754' },
      { label: 'Общественная', value: Math.round(categorySums.social), percent: Math.round(categorySums.social / totalCategoryPoints * 100), color: '#0dcaf0' }
    ];

    // Groups distribution
    const groupCounts = students.reduce((acc, s) => {
      const g = s.group || 'Без группы';
      acc[g] = (acc[g] || 0) + 1;
      return acc;
    }, {});
    const groupsDistribution = Object.keys(groupCounts).map(group => ({ group, count: groupCounts[group], percent: Math.round(groupCounts[group] / (totalStudents || 1) * 100) }));

    res.render('pages/dashboard', {
      title: 'Дашборд',
      activeTab: 'dashboard',
      stats: {
        totalStudents,
        avgScore,
        groupsCount,
        maxScore
      },
      topStudents,
      categoryDistribution,
      groupsDistribution
    });
  } catch (err) {
    console.error('Ошибка при формировании дашборда', err);
    res.status(500).send('Ошибка сервера');
  }
});

app.get('/students', async (req, res) => {
  const groups = await Students.distinct('group');
  const selectedGroup = req.query.group;
  const sortBy = req.query.sortBy || 'name';
  const sortOrder = req.query.sortOrder || 'asc';
  const search = req.query.search || '';

  const query = {};
  if (selectedGroup && selectedGroup !== 'Все группы') {
    query.group = selectedGroup;
  }
  if (search !== '') {
    query.name = { $regex: search, $options: 'i' };
  }

  // Use filtered count
  const totalStudentsCount = await Students.countDocuments(query);

  const pageSize = 15;
  const weights = await Weights.findOne();

  let students = [];

  if (sortBy === 'total_score') {
    // Need to compute total_score for all students before sorting
    const all = await Students.find(query);
    all.forEach(s => {
      s.olimpiads = s.olimpiads || [];
      s.research_contests = s.research_contests || [];
      s.create_contests = s.create_contests || [];
      s.publications = s.publications || [];
      s.sports_championships = s.sports_championships || [];
      s.sports_titles = s.sports_titles || [false, false];
      s.ed_programms = s.ed_programms || 0;
      s.reports = s.reports || 0;
      s.sports_popularization = s.sports_popularization || 0;
      s.cultural_events = s.cultural_events || 0;
    });
    all.forEach(student => { countScore(student, weights); });
    if (sortOrder === 'desc') {
      all.sort((a, b) => (b.total_score || 0) - (a.total_score || 0));
    } else {
      all.sort((a, b) => (a.total_score || 0) - (b.total_score || 0));
    }
    students = all.slice(0, pageSize);
  } else {
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    const sortOptions = {};
    sortOptions[sortBy] = sortDirection;
    students = await Students.find(query).sort(sortOptions).limit(pageSize);
    students.forEach(s => {
      s.olimpiads = s.olimpiads || [];
      s.research_contests = s.research_contests || [];
      s.create_contests = s.create_contests || [];
      s.publications = s.publications || [];
      s.sports_championships = s.sports_championships || [];
      s.sports_titles = s.sports_titles || [false, false];
      s.ed_programms = s.ed_programms || 0;
      s.reports = s.reports || 0;
      s.sports_popularization = s.sports_popularization || 0;
      s.cultural_events = s.cultural_events || 0;
    });
    students.forEach(student => { countScore(student, weights); });
  }

  res.render('pages/students', {
    totalStudentsCount,
    title: 'Студенты',
    activeTab: 'students',
    selectedGroup: selectedGroup || 'Все группы',
    sortBy,
    sortOrder,
    search,
    groups: groups.map(group => ({ group })),
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
  if (!studentId) {
    return res.status(400).send('ID студента не указан');
  }

  const student = await Students.findById(studentId).lean();
  if (!student) {
    return res.status(404).send('Студент не найден');
  }

  console.log(student);
  
  const weights = await Weights.findOne();
  countScore(student, weights);

  const levelLabels = {
    Int: 'Международные',
    Rus: 'Российские / областные',
    Uni: 'Вузовские',
  };

  const getLevelLabel = (pType) => levelLabels[pType] || pType;

  const getContestScore = (contestType, pType, place) => {
    const table = weights[contestType] && weights[contestType][pType];
    if (!table) return 0;
    switch (place) {
      case 1:
        return table.first || 0;
      case 2:
        return table.second || 0;
      case 3:
        return table.third || 0;
      default:
        return 0;
    }
  };

  // Подготовка карточек по видам деятельности
  const academicActivities = [];
  const scientificActivities = [];
  const creativeActivities = [];
  const sportsActivities = [];
  const socialActivities = [];

  // Учебная деятельность
  academicActivities.push({
  title: student.a_student ? 'Отличник' : 'Хорошист',
  description: student.a_student
    ? 'Высокая учебная успеваемость'
    : 'Хорошая учебная успеваемость',
  score: student.a_student
    ? (weights.a_student[0] || 0)
    : (weights.a_student[1] || 0),
  });
  (student.olimpiads || []).forEach(o => {
    academicActivities.push({
      title: 'Предметные учебные олимпиады, конкурсы',
      subtitle: getLevelLabel(o.pType),
      description: `Место: ${o.place}`,
      score: getContestScore('olimpiads', o.pType, o.place),
    });
  });
  if (student.ed_programms > 0) {
    academicActivities.push({
      title: 'Образовательные программы',
      description: `Участий: ${student.ed_programms}`,
      score: (student.ed_programms || 0) * (weights.ed_programms || 0),
    });
  }

  // Научная деятельность
  (student.research_contests || []).forEach(c => {
    scientificActivities.push({
      title: 'Научный конкурс',
      subtitle: getLevelLabel(c.pType),
      description: `Место: ${c.place}`,
      score: getContestScore('research_contests', c.pType, c.place),
    });
  });
  (student.publications || []).forEach((p, idx) => {
    scientificActivities.push({
      title: 'Публикация',
      description: p.rank ? 'ВАК / РИНЦ' : 'Прочее издание',
      extra: `№${idx + 1}`,
      score: p.rank
        ? (weights.publications && weights.publications[0]) || 0
        : (weights.publications && weights.publications[1]) || 0,
    });
  });
  if (student.reports > 0) {
    scientificActivities.push({
      title: 'Доклады / выступления',
      description: `Количество: ${student.reports}`,
      score: (student.reports || 0) * (weights.reports || 0),
    });
  }

  // Творческая деятельность
  (student.create_contests || []).forEach(c => {
    creativeActivities.push({
      title: 'Творческий конкурс',
      subtitle: getLevelLabel(c.pType),
      description: `Место: ${c.place}`,
      score: getContestScore('create_contests', c.pType, c.place),
    });
  });

  // Спортивная деятельность
  if (student.sports_titles && student.sports_titles[0]) {
    sportsActivities.push({
      title: 'Мастер спорта',
      score: (weights.sports_titles && weights.sports_titles[0]) || 0,
    });
  }
  if (student.sports_titles && student.sports_titles[1]) {
    sportsActivities.push({
      title: 'Кандидат в мастера спорта',
      score: (weights.sports_titles && weights.sports_titles[1]) || 0,
    });
  }
  (student.sports_championships || []).forEach(c => {
    let score = 0;
    if (weights.sports_championships && weights.sports_championships[c.pType]) {
      score = c.place === 1
        ? weights.sports_championships[c.pType]
        : weights.sports_championships.other || 0;
    }
    sportsActivities.push({
      title: 'Соревнования',
      subtitle: getLevelLabel(c.pType),
      description: `Место: ${c.place}`,
      score,
    });
  });
  if (student.sports_popularization > 0) {
    sportsActivities.push({
      title: 'Популяризация спорта',
      description: `Активностей: ${student.sports_popularization}`,
      score: (student.sports_popularization || 0) * (weights.sports_popularization || 0),
    });
  }

  // Общественная деятельность
  if (student.starosta) {
    socialActivities.push({
      title: 'Староста группы',
      score: weights.starosta || 0,
    });
  }
  if (student.profsoyuz) {
    socialActivities.push({
      title: 'Актив профсоюза',
      score: weights.profsoyuz || 0,
    });
  }
  if (student.volunteer) {
    socialActivities.push({
      title: 'Волонтёрская деятельность',
      score: weights.volunteer || 0,
    });
  }
  if (student.cultural_events > 0) {
    socialActivities.push({
      title: 'Профориентационная работа, работа в летних лагерях',
      description: `Участий: ${student.cultural_events}`,
      score: (student.cultural_events || 0) * (weights.cultural_events || 0),
    });
  }

  res.render('pages/portfolio', {
    title: 'Портфолио',
    activeTab: '',
    student,
    academicActivities,
    scientificActivities,
    creativeActivities,
    sportsActivities,
    socialActivities,
  });
});

app.post('/portfolio/:id/achievements', async (req, res) => {
  const studentId = req.params.id;
  const {
    type,
    academicSubtype,
    gradeLevel,
    olympLevel,
    olympPlace,
    programsCount,
    scientificSubtype,
    scientificLevel,
    scientificPlace,
    publicationRank,
    reportsCount,
    creativeLevel,
    creativePlace,
    sportsSubtype,
    sportsLevel,
    sportsPopularCount,
    socialSubtype,
    socialCount,
  } = req.body;

  const student = await Students.findById(studentId);
  if (!student) {
    return res.status(404).send('Студент не найден');
  }

  switch (type) {
    case 'academic': {
      if (academicSubtype === 'grade') {
        // отличник / хорошист
        student.a_student = gradeLevel === 'excellent';
      } else if (academicSubtype === 'olympiad' && olympLevel && olympPlace) {
        // предметные олимпиады
        student.olimpiads = student.olimpiads || [];
        student.olimpiads.push({
          pType: olympLevel,
          place: Number(olympPlace),
        });
      } else if (academicSubtype === 'programs' && programsCount) {
        const count = Number(programsCount) || 0;
        student.ed_programms = (student.ed_programms || 0) + count;
      }
      break;
    }
    case 'scientific': {
      if (scientificSubtype === 'contest' && scientificLevel && scientificPlace) {
        student.research_contests = student.research_contests || [];
        student.research_contests.push({
          pType: scientificLevel,
          place: Number(scientificPlace),
        });
      } else if (scientificSubtype === 'publication' && publicationRank) {
        const isVakRisc = publicationRank === 'vak_risc';
        student.publications = student.publications || [];
        student.publications.push({
          rank: isVakRisc,
        });
      } else if (scientificSubtype === 'report' && reportsCount) {
        const count = Number(reportsCount) || 0;
        student.reports = (student.reports || 0) + count;
      }
      break;
    }
    case 'creative': {
      if (creativeLevel && creativePlace) {
        student.create_contests = student.create_contests || [];
        student.create_contests.push({
          pType: creativeLevel,
          place: Number(creativePlace),
        });
      }
      break;
    }
    case 'sports': {
      if (sportsSubtype === 'title_int') {
        // Мастер спорта международного класса – храним в первом флаге
        student.sports_titles = student.sports_titles || [false, false];
        student.sports_titles[0] = true;
      } else if (sportsSubtype === 'title_team') {
        // Член сборной России – используем второй флаг
        student.sports_titles = student.sports_titles || [false, false];
        student.sports_titles[1] = true;
      } else if (sportsSubtype === 'champion' && sportsLevel) {
        // Победитель чемпионата: только выбор чемпионата, место считаем 1
        student.sports_championships = student.sports_championships || [];
        student.sports_championships.push({
          pType: sportsLevel,
          place: 1,
        });
      } else if (sportsSubtype === 'prize') {
        // Призёр (2–3 место), в весах используется ветка other
        student.sports_championships = student.sports_championships || [];
        student.sports_championships.push({
          pType: 'other',
          place: 2,
        });
      } else if (sportsSubtype === 'popularization' && sportsPopularCount) {
        const count = Number(sportsPopularCount) || 0;
        student.sports_popularization = (student.sports_popularization || 0) + count;
      }
      break;
    }
    case 'social': {
      if (socialSubtype === 'starosta') {
        student.starosta = true;
      } else if (socialSubtype === 'profsoyuz') {
        student.profsoyuz = true;
      } else if (socialSubtype === 'volunteer') {
        student.volunteer = true;
      } else if (socialSubtype === 'cultural' && socialCount) {
        const count = Number(socialCount) || 0;
        student.cultural_events = (student.cultural_events || 0) + count;
      }
      break;
    }
    default:
      break;
  }

  await student.save();

  res.redirect(`/portfolio?id=${studentId}`);
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