import { MongoClient, ObjectID } from 'mongodb';

const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;
const cluster = process.env.MONGODB_CLUSTER;
const database = process.env.MONGODB_DATABASE;

const MONGODB_URI_FROM_PARTS =
  username && password && cluster && database
    ? `mongodb+srv://${username}:${password}@${cluster}.mongodb.net/${database}?retryWrites=true&w=majority`
    : undefined;

const MONGODB_URI = process.env.MONGODB_URI || MONGODB_URI_FROM_PARTS;

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error(
      'Missing MongoDB configuration. Set MONGODB_URI or MONGODB_USERNAME, MONGODB_PASSWORD, MONGODB_CLUSTER, and MONGODB_DATABASE.'
    );
  }

  const client = await MongoClient.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  return client;
}

export async function getAllLawyerProfiles(client) {
  const db = client.db();

  const documents = await db.collection('lawyersList').find().toArray();
  // console.log(documents);

  return documents;
}

export async function getLawyerProfile(client, id) {
  const db = client.db();

  const lawyerProfile = await db.collection('lawyersList').findOne({
    bar_council_id: id,
  });

  return lawyerProfile;
}

export async function getLawyerId(client, id) {
  const db = client.db();

  const lawyerProfile = await db.collection('lawyersList').findOne({
    bar_council_id: id,
  });

  return lawyerProfile;
}
