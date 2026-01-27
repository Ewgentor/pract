import mongoose from 'mongoose';

export const Students = mongoose.model('Students', new mongoose.Schema({
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

export const Weights = mongoose.model('Weights', new mongoose.Schema({
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
  sports_titles: {type: [Number], default: [8, 8]}, // [Мастер спорта, Кандидат в мастера спорта],
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