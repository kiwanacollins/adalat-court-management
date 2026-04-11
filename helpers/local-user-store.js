import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

const USERS_FILE_PATH = path.join(process.cwd(), 'data', 'users.dev.json');

async function ensureStoreFile() {
  const dirPath = path.dirname(USERS_FILE_PATH);
  await fs.mkdir(dirPath, { recursive: true });

  try {
    await fs.access(USERS_FILE_PATH);
  } catch (error) {
    await fs.writeFile(USERS_FILE_PATH, '[]', 'utf8');
  }
}

async function readUsers() {
  await ensureStoreFile();
  const fileContent = await fs.readFile(USERS_FILE_PATH, 'utf8');

  try {
    const parsed = JSON.parse(fileContent);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

async function writeUsers(users) {
  await ensureStoreFile();
  await fs.writeFile(USERS_FILE_PATH, JSON.stringify(users, null, 2), 'utf8');
}

export async function findLocalUserByEmail(email) {
  const users = await readUsers();
  return users.find((user) => user.email === email);
}

export async function createLocalUser({
  email,
  password,
  firstName,
  lastName,
  role,
}) {
  const users = await readUsers();
  const newUser = {
    id: randomUUID(),
    email,
    password,
    firstName,
    lastName,
    role: role || 'litigant',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  await writeUsers(users);

  return { insertedId: newUser.id };
}
