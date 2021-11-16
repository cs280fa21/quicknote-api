const faker = require("faker");
const db = require("../server/data/db");
const User = require("../server/model/User");
const Note = require("../server/model/Note");
const UserDao = require("../server/data/UserDao");
const NoteDao = require("../server/data/NoteDao");

const users = new UserDao();
const notes = new NoteDao();

async function createSampleUser(username, role) {
  return users.create({
    username: username,
    password: username,
    role,
  });
}

async function createSampleNotes(author, numNotes) {
  for(let i = 0; i < numNotes; i++) {
    await notes.create({
      title: faker.lorem.sentence(),
      text: faker.lorem.paragraph(),
      author,
    });
  }
}

async function createSampleData() {
  try {
    await db.connect();         // this should not be your production database!!
    await User.deleteMany({});  // delete all users!
    await Note.deleteMany({});  // delete all notes! 

    const user1 = await createSampleUser("client1", "CLIENT");
    await createSampleNotes(user1._id, 3);

    const user2 = await createSampleUser("client2", "CLIENT");
    await createSampleNotes(user2._id, 2);
    
    const user3 = await createSampleUser("admin1", "ADMIN");
    await createSampleNotes(user3._id, 2);

    console.log("Samples created!");
  } catch (err) {
    console.log(err);
  }
}

createSampleData();