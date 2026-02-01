const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/stipendia');
const { Students } = require('./models');

groups = ["PI-301", "PI-302", "PI-303", "IVT-101", "IVT-102", "IST-301", "IST-302"];
names = {male: ["Иван", "Пётр", "Василий", "Илья", "Евгений", "Алексей", "Александр", "Даниил", "Эдуард"], female: ["Ивана", "Попова", "Евгения", "Александра", "Дарья", "Элеонора", "Виктория", "Анна", "Мария"]};
surnames = {male: ["Иванов", "Петров", "Сидоров", "Смирнов", "Попов", "Юров", "Торшин", "Емельянов"], female: ["Иванова", "Петрова", "Сидорова", "Смирнова", "Попова", "Вавилова", "Жилина", "Заец", "Высоцкая", "Гущина"]};
types_contests = ["Int", "Rus", "Uni"];
types_sports = ["Int", "Rus", "CFO", "Regional"];


function studentGenerator(number) {
    for (let i = 0; i < number; i++) {
        const student = new Students({
            group: groups[Math.floor(Math.random() * groups.length)],
            name: Math.random() > 0.5 ? names.male[Math.floor(Math.random() * names.male.length)] + " " + surnames.male[Math.floor(Math.random() * surnames.male.length)] :
                names.female[Math.floor(Math.random() * names.female.length)] + " " + surnames.female[Math.floor(Math.random() * surnames.female.length)],
            a_student: Math.random() > 0.5,
            olimpiads: (() => {
                arr = [];
                for (let j = 0; j < Math.floor(Math.random() * 3); j++) {
                    arr.push({pType: types_contests[Math.floor(Math.random() * types_contests.length)], place: Math.floor(Math.random() * 3) + 1});
                }
                console.log(arr);
                return arr;
            })(),
            ed_programms: Math.floor(Math.random() * 5),
            research_contests: (() => {
                arr = [];
                for (let j = 0; j < Math.floor(Math.random() * 3); j++) {
                    arr.push({pType: types_contests[Math.floor(Math.random() * types_contests.length)], place: Math.floor(Math.random() * 3) + 1});
                }
                return arr;
            })(),
            publications: (() => {
                arr = [];
                for (let j = 0; j < Math.floor(Math.random() * 5); j++) {
                    arr.push({rank: Math.random() > 0.5});
                }
                return arr;
            })(),
            reports: Math.floor(Math.random() * 10),
            create_contests: (() => {
                arr = [];
                for (let j = 0; j < Math.floor(Math.random() * 3); j++) {
                    arr.push({pType: types_contests[Math.floor(Math.random() * types_contests.length)], place: Math.floor(Math.random() * 3) + 1});
                }
                return arr;
            })(),
            sports_titles: [ Math.random() > 0.5, Math.random() > 0.5 ],
            sports_championships: (() => {
                arr = [];
                for (let j = 0; j < Math.floor(Math.random() * 3); j++) {
                    arr.push({pType: types_sports[Math.floor(Math.random() * types_sports.length)], place: Math.floor(Math.random() * 3) + 1});
                }
                return arr;
            })(),
            sports_popularization: Math.floor(Math.random() * 10),
            starosta: Math.random() > 0.5,
            profsoyuz: Math.random() > 0.5,
            volunteer: Math.random() > 0.5,
            cultural_events: Math.floor(Math.random() * 10)
        });
        student.save().then(() => console.log(`Student ${i + 1} saved`));
    }
}

studentGenerator(50);