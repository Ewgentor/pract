const mongoose = require('mongoose');
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

groups = ["PI-301", "PI-302", "PI-303", "IVT-101", "IVT-102", "IST-301", "IST-302"];
names = ["Ivan Ivanov", "Petr Petrov", "Sidor Sidorov", "Anna Ivanova", "Elena Petrova", "Maria Sidorova", "Dmitry Smirnov", "Olga Kuznetsova", "Alexey Popov", "Natalia Lebedeva"];
types_contests = ["Int", "Rus", "Uni"];
types_sports = ["Int", "Rus", "CFO", "Regional"];



function studentGenerator(number) {
    for (let i = 0; i < number; i++) {
        const student = new Students({
            group: groups[Math.floor(Math.random() * groups.length)],
            name: names[Math.floor(Math.random() * names.length)],
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