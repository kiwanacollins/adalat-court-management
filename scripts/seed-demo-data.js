const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');

const ROOT_DIR = process.cwd();
const USERS_FILE_PATH = path.join(ROOT_DIR, 'data', 'users.dev.json');
const ENV_FILE_PATH = path.join(ROOT_DIR, '.env.local');
const DEMO_PASSWORD = 'Demo12345!';
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

function buildUsers() {
  const rolePrefixes = {
    magistrate: 'magistrate',
    clerk: 'clerk',
    litigant: 'litigant',
  };

  const users = [];

  for (const [role, prefix] of Object.entries(rolePrefixes)) {
    for (let index = 1; index <= 20; index += 1) {
      const number = String(index).padStart(2, '0');
      users.push({
        email: `${prefix}${number}@demo.local`,
        password: DEMO_PASSWORD,
        firstName: role === 'litigant' ? 'Litigant' : role === 'clerk' ? 'Court' : 'Hon',
        lastName: `${role.charAt(0).toUpperCase()}${role.slice(1)} ${number}`,
        role,
      });
    }
  }

  return users;
}

function buildCases(users) {
  const magistrates = users.filter((user) => user.role === 'magistrate');
  const clerks = users.filter((user) => user.role === 'clerk');
  const litigants = users.filter((user) => user.role === 'litigant');

  const caseTypes = ['Criminal', 'Civil', 'Land Dispute', 'Family', 'Others'];
  const statuses = ['Pending', 'Scheduled', 'Adjourned', 'Concluded', 'Dismissed'];
  const courtrooms = ['Courtroom 1', 'Courtroom 2', 'Courtroom 3'];
  const cases = [];

  for (let index = 0; index < 20; index += 1) {
    const dayOffset = index - 10;
    const filingDate = new Date();
    filingDate.setDate(filingDate.getDate() - index * 2);

    const hearingDate = new Date();
    hearingDate.setDate(hearingDate.getDate() + dayOffset);

    const caseType = caseTypes[index % caseTypes.length];
    const status = statuses[index % statuses.length];
    const assignedMagistrate = magistrates[index % magistrates.length];
    const registeredBy = clerks[index % clerks.length] || magistrates[index % magistrates.length];
    const complainant = litigants[index % litigants.length];
    const respondent = litigants[(index + 7) % litigants.length];
    const isScheduled = status === 'Scheduled' || status === 'Adjourned' || status === 'Concluded';

    cases.push({
      case_number: `LGM/${YEAR}/${String(901 + index)}`,
      case_type: caseType,
      case_description: `Demo ${caseType.toLowerCase()} matter ${index + 1} for training and testing the dashboard workflows.`,
      complainant_name: `${complainant.firstName} ${complainant.lastName}`,
      complainant_contact: `+25670010${String(10 + index).padStart(2, '0')}`,
      respondent_name: `${respondent.firstName} ${respondent.lastName}`,
      respondent_contact: `+25670120${String(10 + index).padStart(2, '0')}`,
      assigned_magistrate: `${assignedMagistrate.firstName} ${assignedMagistrate.lastName}`,
      hearing_date: isScheduled ? hearingDate.toISOString().split('T')[0] : '',
      hearing_time: isScheduled ? `${String(8 + (index % 8)).padStart(2, '0')}:30` : '',
      courtroom: isScheduled ? courtrooms[index % courtrooms.length] : '',
      priority: index % 4 === 0 ? 'Urgent' : 'Normal',
      status,
      status_history: status === 'Pending'
        ? []
        : [
            {
              status,
              date: new Date(Date.now() - index * 86400000).toISOString(),
              note: status === 'Adjourned' ? 'Adjourned for additional submissions.' : '',
              changed_by: registeredBy.email,
            },
          ],
      registered_by: registeredBy.email,
      filing_date: filingDate.toISOString().split('T')[0],
      uid: `demo-case-${index + 1}`,
    });
  }

  return cases;
}

function buildNotifications(cases) {
  return cases
    .filter((item) => item.status === 'Scheduled' || item.status === 'Adjourned')
    .map((item, index) => ({
      case_number: item.case_number,
      case_uid: item.uid,
      type: item.status === 'Scheduled' ? 'hearing_scheduled' : 'hearing_adjourned',
      message:
        item.status === 'Scheduled'
          ? `Case ${item.case_number} has been scheduled for ${item.hearing_date} at ${item.hearing_time}.`
          : `Case ${item.case_number} has been adjourned to ${item.hearing_date || 'TBD'}.`,
      for_role: index % 2 === 0 ? 'all' : 'magistrate',
      for_name: item.assigned_magistrate,
      read: index % 3 === 0,
      created_at: new Date(Date.now() - index * 3600000).toISOString(),
    }));
}

async function seedMongoData({ uri, users, cases, notifications }) {
  const client = await MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    const db = client.db();

    await db.collection('users').deleteMany({
      email: { $regex: '^(magistrate|clerk|litigant)\\d{2}@demo\\.local$' },
    });
    await db.collection('cases').deleteMany({ uid: { $regex: '^demo-case-' } });
    await db.collection('notifications').deleteMany({ case_uid: { $regex: '^demo-case-' } });

    const bcryptPassword = await bcrypt.hash(DEMO_PASSWORD, 12);
    await db.collection('users').insertMany(
      users.map((user) => ({
        ...user,
        password: bcryptPassword,
      }))
    );

    await db.collection('cases').insertMany(cases);
    if (notifications.length > 0) {
      await db.collection('notifications').insertMany(notifications);
    }
  } finally {
    await client.close();
  }
}

async function main() {
  const env = {
    ...parseEnvFile(ENV_FILE_PATH),
    ...process.env,
  };

  const users = buildUsers();
  const cases = buildCases(users);
  const notifications = buildNotifications(cases);

  const localUsers = readLocalUsers();
  const filteredLocalUsers = localUsers.filter(
    (user) => !/^(magistrate|clerk|litigant)\d{2}@demo\.local$/.test(user.email)
  );

  const bcryptPassword = await bcrypt.hash(DEMO_PASSWORD, 12);
  const localSeedUsers = users.map((user) => ({
    id: `${user.role}-${user.email}`,
    email: user.email,
    password: bcryptPassword,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    createdAt: new Date().toISOString(),
  }));

  writeLocalUsers([...filteredLocalUsers, ...localSeedUsers]);

  const mongoUri = resolveMongoUri(env);
  if (mongoUri) {
    await seedMongoData({ uri: mongoUri, users, cases, notifications });
    console.log('Seeded MongoDB collections and local demo users.');
  } else {
    console.log('MongoDB config not found. Seeded local demo users only.');
  }

  console.log(`Demo password for all seeded accounts: ${DEMO_PASSWORD}`);
  console.log(`Seeded ${users.length} users, ${cases.length} cases, and ${notifications.length} notifications.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});