const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');

const ROOT_DIR = process.cwd();
const USERS_FILE_PATH = path.join(ROOT_DIR, 'data', 'users.dev.json');
const ENV_FILE_PATH = path.join(ROOT_DIR, '.env.local');
const DEMO_PASSWORD = 'Demo12345!';
const CURRENT_MAGISTRATE_NAME = process.env.DEMO_MAGISTRATE_NAME || 'kiwana';
const YEAR = new Date().getFullYear();

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};

  const content = fs.readFileSync(filePath, 'utf8');
  return content.split(/\r?\n/).reduce((accumulator, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return accumulator;

    const equalsIndex = trimmed.indexOf('=');
    if (equalsIndex === -1) return accumulator;

    const key = trimmed.slice(0, equalsIndex).trim();
    const value = trimmed.slice(equalsIndex + 1).trim();
    if (key) accumulator[key] = value;
    return accumulator;
  }, {});
}

function resolveMongoUri(env) {
  if (env.MONGODB_URI) return env.MONGODB_URI;

  const { MONGODB_USERNAME, MONGODB_PASSWORD, MONGODB_CLUSTER, MONGODB_DATABASE } = env;
  if (MONGODB_USERNAME && MONGODB_PASSWORD && MONGODB_CLUSTER && MONGODB_DATABASE) {
    return `mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_CLUSTER}.mongodb.net/${MONGODB_DATABASE}?retryWrites=true&w=majority`;
  }

  return null;
}

function ensureUsersFile() {
  const dirPath = path.dirname(USERS_FILE_PATH);
  fs.mkdirSync(dirPath, { recursive: true });
  if (!fs.existsSync(USERS_FILE_PATH)) {
    fs.writeFileSync(USERS_FILE_PATH, '[]', 'utf8');
  }
}

function readLocalUsers() {
  ensureUsersFile();
  try {
    const parsed = JSON.parse(fs.readFileSync(USERS_FILE_PATH, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalUsers(users) {
  ensureUsersFile();
  fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2), 'utf8');
}

// ─── PEOPLE DATA ──────────────────────────────────────────────────────────────

const MAGISTRATES = [
  { firstName: 'Sarah',    lastName: 'Nakato',       email: 'magistrate01@demo.local' },
  { firstName: 'David',    lastName: 'Ssemwogerere', email: 'magistrate02@demo.local' },
  { firstName: 'Florence', lastName: 'Apio',         email: 'magistrate03@demo.local' },
  { firstName: 'Moses',    lastName: 'Onyango',      email: 'magistrate04@demo.local' },
  { firstName: 'Judith',   lastName: 'Namutebi',     email: 'magistrate05@demo.local' },
];

const CLERKS = [
  { firstName: 'Grace',    lastName: 'Nalubega',  email: 'clerk01@demo.local' },
  { firstName: 'Robert',   lastName: 'Tumusiime', email: 'clerk02@demo.local' },
  { firstName: 'Patricia', lastName: 'Namukasa',  email: 'clerk03@demo.local' },
];

const LITIGANTS = [
  { firstName: 'James',    lastName: 'Muwonge',   email: 'litigant01@demo.local' },
  { firstName: 'Agnes',    lastName: 'Nassali',   email: 'litigant02@demo.local' },
  { firstName: 'Peter',    lastName: 'Kabuye',    email: 'litigant03@demo.local' },
  { firstName: 'Prossy',   lastName: 'Nakalembe', email: 'litigant04@demo.local' },
  { firstName: 'Emmanuel', lastName: 'Ssalongo',  email: 'litigant05@demo.local' },
  { firstName: 'Harriet',  lastName: 'Birungi',   email: 'litigant06@demo.local' },
  { firstName: 'Geoffrey', lastName: 'Kato',      email: 'litigant07@demo.local' },
  { firstName: 'Lydia',    lastName: 'Nansubuga', email: 'litigant08@demo.local' },
  { firstName: 'Charles',  lastName: 'Bbosa',     email: 'litigant09@demo.local' },
  { firstName: 'Miriam',   lastName: 'Akello',    email: 'litigant10@demo.local' },
  { firstName: 'Patrick',  lastName: 'Lutalo',    email: 'litigant11@demo.local' },
  { firstName: 'Fatuma',   lastName: 'Nabirye',   email: 'litigant12@demo.local' },
  { firstName: 'Stephen',  lastName: 'Waiswa',    email: 'litigant13@demo.local' },
  { firstName: 'Annet',    lastName: 'Nandawula', email: 'litigant14@demo.local' },
  { firstName: 'Richard',  lastName: 'Mukasa',    email: 'litigant15@demo.local' },
];

function fullName(u) { return u.firstName + ' ' + u.lastName; }

function buildUsers() {
  return [
    ...MAGISTRATES.map((u) => ({ ...u, role: 'magistrate' })),
    ...CLERKS.map((u) => ({ ...u, role: 'clerk' })),
    ...LITIGANTS.map((u) => ({ ...u, role: 'litigant' })),
  ];
}

// ─── CASE TEMPLATES ───────────────────────────────────────────────────────────

const TEMPLATES = [
  // 0–5  Land Dispute
  { type: 'Land Dispute', desc: 'Complainant alleges the respondent forcefully occupied and cultivated their registered 2-acre plot in Lwengo Sub-county, contrary to the land title held.' },
  { type: 'Land Dispute', desc: 'Respondent erected a permanent structure on land the complainant claims was inherited from their late father. No formal sale agreement was executed.' },
  { type: 'Land Dispute', desc: 'Complainant challenges the validity of a land sale conducted during her absence, contending that the signature on the transfer form was forged.' },
  { type: 'Land Dispute', desc: 'Boundary dispute between neighbouring homesteads. Complainant claims the respondent relocated boundary markers and encroached on approximately 0.5 acres.' },
  { type: 'Land Dispute', desc: 'Complainant, as administrator of the estate of the deceased, seeks eviction of the respondent who has occupied estate land without authority since the burial.' },
  { type: 'Land Dispute', desc: 'Dispute over grazing rights on communal land. Complainant alleges respondent fenced off a portion historically used by community members for livestock.' },
  // 6–11 Criminal
  { type: 'Criminal', desc: 'Accused allegedly assaulted the complainant with a hoe handle following a dispute over crop damage, causing grievous bodily harm. Medical report attached.' },
  { type: 'Criminal', desc: 'Accused is charged with theft by servant, having allegedly misappropriated UGX 3,450,000 over three months while employed as a shopkeeper.' },
  { type: 'Criminal', desc: 'Accused allegedly broke into the complainant\'s shop at night and stole merchandise valued at UGX 8,200,000. Accused was apprehended the following morning.' },
  { type: 'Criminal', desc: 'Accused faces charges of obtaining goods by false pretences, collecting crops worth UGX 1,800,000 from farmers promising payment from a nonexistent cooperative.' },
  { type: 'Criminal', desc: 'Charge of malicious damage to property. Accused allegedly destroyed the complainant\'s banana plantation in retaliation for a previous land dispute ruling.' },
  { type: 'Criminal', desc: 'Accused charged with threatening violence, having allegedly wielded a machete and threatened to kill the complainant over an unpaid debt.' },
  // 12–17 Civil
  { type: 'Civil', desc: 'Complainant sold a motorcycle to the respondent for UGX 4,500,000. Respondent paid UGX 2,000,000 and has since refused to pay the outstanding balance.' },
  { type: 'Civil', desc: 'Complainant lent respondent UGX 6,000,000 for business purposes, to be repaid within 12 months. Respondent has made no repayment despite repeated demands.' },
  { type: 'Civil', desc: 'Complainant claims damages arising from a road traffic accident caused by the respondent\'s negligent driving. Complainant sustained injuries and vehicle damage.' },
  { type: 'Civil', desc: 'Landlord seeks recovery of eight months\' accumulated rent arrears totalling UGX 3,200,000 and vacant possession of the rented premises.' },
  { type: 'Civil', desc: 'Breach of building contract. Complainant paid UGX 12,000,000 for construction of two rooms. Respondent abandoned works after partial completion.' },
  { type: 'Civil', desc: 'Complainant alleges that the respondent, a coffee cooperative middleman, withheld payments for three seasons totalling approximately UGX 4,100,000.' },
  // 18–22 Family
  { type: 'Family', desc: 'Petitioner seeks dissolution of marriage on grounds of cruelty and desertion. The parties have been separated for over four years with no cohabitation.' },
  { type: 'Family', desc: 'Mother seeks custody of two minor children aged 5 and 8. Father has been in possession of the children since separation and denies the mother access visits.' },
  { type: 'Family', desc: 'Complainant, an elderly widow, claims her stepsons are denying her the right to occupy the matrimonial home following the death of her husband.' },
  { type: 'Family', desc: 'Petitioner applies for monthly maintenance for three minor children. Respondent has not provided any financial support since the parties separated 18 months ago.' },
  { type: 'Family', desc: 'Dispute over distribution of deceased\'s estate. Complainant alleges the second wife and her children are taking a disproportionate share of land and cattle.' },
  // 23–24 Others
  { type: 'Others', desc: 'Complainant challenges her expulsion from a local cooperative society without following the due process outlined in the cooperative\'s constitution.' },
  { type: 'Others', desc: 'Complainant alleges the respondent Local Council chairperson wrongfully confiscated market stall goods valued at UGX 2,300,000 without a court order.' },
];

function isoDate(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

const TIMES = ['08:30','09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00'];
const ROOMS = ['Courtroom 1','Courtroom 2','Courtroom 3'];

function buildCases() {
  const cases = [];
  const T = TEMPLATES;
  const M = MAGISTRATES;

  function makeHistory(status, daysAgo, note, by) {
    return [{ status, date: isoDate(-daysAgo), note: note || '', changed_by: by || CLERKS[0].email }];
  }

  function push(template, opts) {
    const idx = cases.length;
    const caseNum = 'LGM/' + YEAR + '/' + String(idx + 1).padStart(3, '0');
    const reg = CLERKS[idx % CLERKS.length];
    cases.push({
      case_number: caseNum,
      case_type: template.type,
      case_description: template.desc,
      complainant_name: fullName(LITIGANTS[idx % LITIGANTS.length]),
      complainant_contact: '+256770' + String(100000 + idx * 1301).slice(0, 6),
      respondent_name: fullName(LITIGANTS[(idx + 5) % LITIGANTS.length]),
      respondent_contact: '+256780' + String(200000 + idx * 1709).slice(0, 6),
      assigned_magistrate: opts.magistrate
        ? (opts.magistrate.lastName ? fullName(opts.magistrate) : opts.magistrate.firstName)
        : '',
      hearing_date: opts.hearingDate || '',
      hearing_time: opts.hearingTime || '',
      courtroom: opts.courtroom || '',
      priority: opts.priority || 'Normal',
      status: opts.status,
      status_history: opts.statusHistory || [],
      registered_by: opts.registeredBy || reg.email,
      filing_date: opts.filingDate || isoDate(-(idx * 3 + 5)),
      uid: 'demo-case-' + (idx + 1),
    });
  }

  // PENDING (10 cases — no hearing date yet)
  push(T[0],  { status: 'Pending', magistrate: { firstName: CURRENT_MAGISTRATE_NAME, lastName: '', email: `${CURRENT_MAGISTRATE_NAME}@demo.local` }, filingDate: isoDate(-14) });
  push(T[6],  { status: 'Pending', magistrate: { firstName: CURRENT_MAGISTRATE_NAME, lastName: '', email: `${CURRENT_MAGISTRATE_NAME}@demo.local` }, priority: 'Urgent', filingDate: isoDate(-3) });
  push(T[13], { status: 'Pending', magistrate: { firstName: CURRENT_MAGISTRATE_NAME, lastName: '', email: `${CURRENT_MAGISTRATE_NAME}@demo.local` }, filingDate: isoDate(-7) });
  push(T[19], { status: 'Pending', filingDate: isoDate(-2) });
  push(T[22], { status: 'Pending', magistrate: { firstName: CURRENT_MAGISTRATE_NAME, lastName: '', email: `${CURRENT_MAGISTRATE_NAME}@demo.local` }, filingDate: isoDate(-10) });
  push(T[7],  { status: 'Pending', magistrate: { firstName: CURRENT_MAGISTRATE_NAME, lastName: '', email: `${CURRENT_MAGISTRATE_NAME}@demo.local` }, priority: 'Urgent', filingDate: isoDate(-1) });
  push(T[16], { status: 'Pending', magistrate: { firstName: CURRENT_MAGISTRATE_NAME, lastName: '', email: `${CURRENT_MAGISTRATE_NAME}@demo.local` }, filingDate: isoDate(-5) });
  push(T[23], { status: 'Pending', filingDate: isoDate(-4) });
  push(T[10], { status: 'Pending', magistrate: M[1], filingDate: isoDate(-8) });
  push(T[20], { status: 'Pending', magistrate: M[2], filingDate: isoDate(-6) });

  // TODAY'S HEARINGS (4 cases)
  push(T[1],  { status: 'Scheduled', magistrate: M[0], hearingDate: isoDate(0), hearingTime: TIMES[0], courtroom: ROOMS[0], filingDate: isoDate(-20), statusHistory: makeHistory('Scheduled', 15, '', CLERKS[0].email) });
  push(T[8],  { status: 'Scheduled', magistrate: { firstName: CURRENT_MAGISTRATE_NAME, lastName: '', email: `${CURRENT_MAGISTRATE_NAME}@demo.local` }, hearingDate: isoDate(0), hearingTime: TIMES[2], courtroom: ROOMS[1], priority: 'Urgent', filingDate: isoDate(-18), statusHistory: makeHistory('Scheduled', 12, '', CLERKS[1].email) });
  push(T[14], { status: 'Scheduled', magistrate: { firstName: CURRENT_MAGISTRATE_NAME, lastName: '', email: `${CURRENT_MAGISTRATE_NAME}@demo.local` }, hearingDate: isoDate(0), hearingTime: TIMES[4], courtroom: ROOMS[2], filingDate: isoDate(-22), statusHistory: makeHistory('Scheduled', 10, '', CLERKS[0].email) });
  push(T[3],  { status: 'Adjourned', magistrate: M[2], hearingDate: isoDate(0), hearingTime: TIMES[7], courtroom: ROOMS[0], filingDate: isoDate(-30), statusHistory: makeHistory('Adjourned', 5, 'Parties requested time to negotiate.', CLERKS[2].email) });

  // THIS WEEK (days 1–5)
  push(T[4],  { status: 'Scheduled', magistrate: M[1], hearingDate: isoDate(1), hearingTime: TIMES[1], courtroom: ROOMS[0], filingDate: isoDate(-25), statusHistory: makeHistory('Scheduled', 20, '', CLERKS[0].email) });
  push(T[11], { status: 'Scheduled', magistrate: M[3], hearingDate: isoDate(2), hearingTime: TIMES[3], courtroom: ROOMS[1], filingDate: isoDate(-16), statusHistory: makeHistory('Scheduled', 11, '', CLERKS[1].email) });
  push(T[18], { status: 'Scheduled', magistrate: M[0], hearingDate: isoDate(3), hearingTime: TIMES[5], courtroom: ROOMS[2], filingDate: isoDate(-12), statusHistory: makeHistory('Scheduled', 8, '', CLERKS[0].email) });
  push(T[21], { status: 'Adjourned', magistrate: M[4], hearingDate: isoDate(3), hearingTime: TIMES[6], courtroom: ROOMS[0], priority: 'Urgent', filingDate: isoDate(-40), statusHistory: makeHistory('Adjourned', 3, 'Witness unavailable; hearing rescheduled.', CLERKS[2].email) });
  push(T[5],  { status: 'Scheduled', magistrate: M[2], hearingDate: isoDate(4), hearingTime: TIMES[8], courtroom: ROOMS[1], filingDate: isoDate(-9), statusHistory: makeHistory('Scheduled', 4, '', CLERKS[1].email) });
  push(T[15], { status: 'Scheduled', magistrate: M[1], hearingDate: isoDate(5), hearingTime: TIMES[0], courtroom: ROOMS[2], filingDate: isoDate(-11), statusHistory: makeHistory('Scheduled', 6, '', CLERKS[0].email) });

  // NEXT WEEK (days 7–14)
  push(T[2],  { status: 'Scheduled', magistrate: M[3], hearingDate: isoDate(7),  hearingTime: TIMES[2], courtroom: ROOMS[0], filingDate: isoDate(-6),  statusHistory: makeHistory('Scheduled', 1, '', CLERKS[2].email) });
  push(T[9],  { status: 'Scheduled', magistrate: M[0], hearingDate: isoDate(8),  hearingTime: TIMES[4], courtroom: ROOMS[1], filingDate: isoDate(-7),  statusHistory: makeHistory('Scheduled', 2, '', CLERKS[0].email) });
  push(T[12], { status: 'Adjourned', magistrate: M[4], hearingDate: isoDate(9),  hearingTime: TIMES[7], courtroom: ROOMS[2], filingDate: isoDate(-35), statusHistory: makeHistory('Adjourned', 2, 'Complainant failed to appear; bench warrant issued.', CLERKS[1].email) });
  push(T[17], { status: 'Scheduled', magistrate: M[1], hearingDate: isoDate(10), hearingTime: TIMES[9], courtroom: ROOMS[0], filingDate: isoDate(-5),  statusHistory: makeHistory('Scheduled', 3, '', CLERKS[0].email) });
  push(T[24], { status: 'Scheduled', magistrate: M[2], hearingDate: isoDate(14), hearingTime: TIMES[1], courtroom: ROOMS[1], priority: 'Urgent', filingDate: isoDate(-4), statusHistory: makeHistory('Scheduled', 1, '', CLERKS[2].email) });

  // ADDITIONAL ADJOURNED
  push(T[6],  { status: 'Adjourned', magistrate: M[0], hearingDate: isoDate(2),  hearingTime: TIMES[3], courtroom: ROOMS[2], filingDate: isoDate(-55), statusHistory: makeHistory('Adjourned', 10, 'Respondent sought legal representation; adjourned.', CLERKS[0].email) });
  push(T[1],  { status: 'Adjourned', magistrate: M[3], hearingDate: isoDate(6),  hearingTime: TIMES[5], courtroom: ROOMS[0], filingDate: isoDate(-48), statusHistory: makeHistory('Adjourned', 7, 'Case adjourned for mediation attempt.', CLERKS[1].email) });
  push(T[13], { status: 'Adjourned', magistrate: M[1], hearingDate: isoDate(11), hearingTime: TIMES[8], courtroom: ROOMS[1], priority: 'Urgent', filingDate: isoDate(-60), statusHistory: makeHistory('Adjourned', 4, 'Key evidence not yet processed by police.', CLERKS[2].email) });
  push(T[22], { status: 'Adjourned', magistrate: M[2], hearingDate: isoDate(13), hearingTime: TIMES[0], courtroom: ROOMS[2], filingDate: isoDate(-42), statusHistory: makeHistory('Adjourned', 6, 'Additional time granted to file written submissions.', CLERKS[0].email) });

  // CONCLUDED (12 cases)
  const concludedTemplates = [T[0],T[3],T[4],T[7],T[9],T[11],T[14],T[15],T[18],T[20],T[23],T[24]];
  concludedTemplates.forEach(function(t, i) {
    const mag = M[i % M.length];
    push(t, {
      status: 'Concluded',
      magistrate: mag,
      hearingDate: isoDate(-(10 + i * 4)),
      hearingTime: TIMES[i % TIMES.length],
      courtroom: ROOMS[i % ROOMS.length],
      filingDate: isoDate(-(40 + i * 5)),
      statusHistory: [
        { status: 'Scheduled', date: isoDate(-(30 + i * 5)), note: '',                  changed_by: CLERKS[i % CLERKS.length].email },
        { status: 'Concluded', date: isoDate(-(10 + i * 4)), note: 'Judgment delivered.', changed_by: mag.email },
      ],
    });
  });

  // DISMISSED (5 cases)
  const dismissedTemplates = [T[5],T[8],T[10],T[16],T[19]];
  dismissedTemplates.forEach(function(t, i) {
    const mag = M[(i + 2) % M.length];
    push(t, {
      status: 'Dismissed',
      magistrate: mag,
      hearingDate: isoDate(-(8 + i * 5)),
      hearingTime: TIMES[i % TIMES.length],
      courtroom: ROOMS[i % ROOMS.length],
      filingDate: isoDate(-(35 + i * 6)),
      statusHistory: [
        { status: 'Scheduled', date: isoDate(-(25 + i * 6)), note: '',                                           changed_by: CLERKS[i % CLERKS.length].email },
        { status: 'Dismissed', date: isoDate(-(8 + i * 5)),  note: 'Case dismissed for lack of sufficient evidence.', changed_by: mag.email },
      ],
    });
  });

  return cases;
}

function buildNotifications(cases) {
  const notes = [];
  const today = isoDate(0);
  const weekOut = isoDate(7);

  cases.forEach(function(c) {
    if (c.status === 'Scheduled' && c.hearing_date && c.hearing_date <= weekOut) {
      notes.push({
        case_number: c.case_number,
        case_uid: c.uid,
        type: 'hearing_scheduled',
        message: 'Case ' + c.case_number + ' (' + c.case_type + ') — ' + c.complainant_name + ' vs ' + c.respondent_name + ' — hearing on ' + c.hearing_date + ' at ' + (c.hearing_time || 'TBD') + ', ' + (c.courtroom || '') + '.',
        for_role: c.assigned_magistrate === CURRENT_MAGISTRATE_NAME ? 'magistrate' : 'all',
        for_name: c.assigned_magistrate,
        read: false,
        created_at: new Date(Date.now() - Math.floor(Math.random() * 43200000)).toISOString(),
      });
    }
    if (c.status === 'Adjourned') {
      notes.push({
        case_number: c.case_number,
        case_uid: c.uid,
        type: 'hearing_adjourned',
        message: 'Case ' + c.case_number + ' has been adjourned. New hearing date: ' + (c.hearing_date || 'to be set') + '.',
        for_role: 'magistrate',
        for_name: c.assigned_magistrate,
        read: false,
        created_at: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(),
      });
    }
    if (c.status === 'Concluded') {
      notes.push({
        case_number: c.case_number,
        case_uid: c.uid,
        type: 'case_concluded',
        message: 'Case ' + c.case_number + ' has been concluded. Judgment delivered by ' + c.assigned_magistrate + '.',
        for_role: 'clerk',
        for_name: null,
        read: Math.random() > 0.5,
        created_at: new Date(new Date(c.hearing_date).getTime() + 3600000).toISOString(),
      });
    }
  });

  // Today-specific reminders for all roles
  cases
    .filter(function(c) { return c.hearing_date === today && (c.status === 'Scheduled' || c.status === 'Adjourned'); })
    .forEach(function(c) {
      notes.push({
        case_number: c.case_number,
        case_uid: c.uid,
        type: 'hearing_today',
        message: 'REMINDER: Case ' + c.case_number + ' (' + c.case_type + ') is scheduled for today at ' + (c.hearing_time || 'TBD') + ' in ' + (c.courtroom || 'TBD') + '.',
        for_role: 'all',
        for_name: c.assigned_magistrate,
        read: false,
        created_at: new Date().toISOString(),
      });
    });

  return notes;
}

async function seedMongoData({ uri, users, cases, notifications }) {
  const client = await MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    const db = client.db();
    const emails = users.map(function(u) { return u.email; });

    await db.collection('users').deleteMany({ email: { $in: emails } });
    await db.collection('cases').deleteMany({ uid: { $regex: '^demo-case-' } });
    await db.collection('notifications').deleteMany({ case_uid: { $regex: '^demo-case-' } });

    const bcryptPassword = await bcrypt.hash(DEMO_PASSWORD, 12);
    await db.collection('users').insertMany(
      users.map(function(user) { return Object.assign({}, user, { password: bcryptPassword }); })
    );

    await db.collection('cases').insertMany(cases);
    if (notifications.length > 0) {
      await db.collection('notifications').insertMany(notifications);
    }

    console.log('  \u2705 MongoDB seeded');
  } finally {
    await client.close();
  }
}

async function main() {
  const env = Object.assign({}, parseEnvFile(ENV_FILE_PATH), process.env);

  const users = buildUsers();
  const cases = buildCases();
  const notifications = buildNotifications(cases);

  // Update local JSON store
  const existing = readLocalUsers().filter(
    function(u) { return !users.some(function(s) { return s.email === u.email; }); }
  );
  const bcryptPassword = await bcrypt.hash(DEMO_PASSWORD, 12);
  writeLocalUsers(existing.concat(users.map(function(u) {
    return {
      id: 'demo-' + u.role + '-' + u.email,
      email: u.email,
      password: bcryptPassword,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      createdAt: new Date().toISOString(),
    };
  })));
  console.log('  \u2705 Local user store updated (' + users.length + ' users)');

  // Seed MongoDB if configured
  const mongoUri = resolveMongoUri(env);
  if (mongoUri) {
    await seedMongoData({ uri: mongoUri, users, cases, notifications });
  } else {
    console.log('  \u2139\uFE0F  MongoDB config not found \u2014 skipped (local store only).');
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  const byStatus = cases.reduce(function(a, c) { a[c.status] = (a[c.status] || 0) + 1; return a; }, {});
  const todayCount = cases.filter(function(c) { return c.hearing_date === isoDate(0); }).length;
  const bar = '\u2501'.repeat(64);

  console.log('\n' + bar);
  console.log('  E-JUDICIARY CMS \u2014 DEMO SEED COMPLETE');
  console.log(bar);
  console.log('  Password (all accounts): ' + DEMO_PASSWORD + '\n');
  console.log('  Cases         : ' + cases.length + '  (' + Object.entries(byStatus).map(function(e) { return e[1] + ' ' + e[0]; }).join(', ') + ')');
  console.log('  Today hearings: ' + todayCount);
  console.log('  Notifications : ' + notifications.length);
  console.log('  Users         : ' + users.length + '  (' + MAGISTRATES.length + ' magistrates, ' + CLERKS.length + ' clerks, ' + LITIGANTS.length + ' litigants)\n');
  console.log('  DEMO LOGINS');
  console.log('  ' + '\u2500'.repeat(60));
  console.log('\n  MAGISTRATES');
  MAGISTRATES.forEach(function(u) { console.log('    ' + u.email.padEnd(36) + fullName(u)); });
  console.log('\n  CLERKS');
  CLERKS.forEach(function(u) { console.log('    ' + u.email.padEnd(36) + fullName(u)); });
  console.log('\n  LITIGANTS (first 5)');
  LITIGANTS.slice(0, 5).forEach(function(u) { console.log('    ' + u.email.padEnd(36) + fullName(u)); });
  console.log('\n' + bar + '\n');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});