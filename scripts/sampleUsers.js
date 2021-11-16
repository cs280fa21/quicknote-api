const db = require("../server/data/db");
const UserDao = require("../server/data/UserDao");

async function createSampleUsers(username, role) {
  try {
    await db.connect();

    const users = new UserDao();
    const user = await users.create({
      username: username,
      password: username,
      role: role,
    });
    console.log(user);
  } catch (err) {
    console.log(err);
  }
}

createSampleUsers("client1", "CLIENT");
createSampleUsers("client2", "CLIENT");
createSampleUsers("admin1", "ADMIN");
createSampleUsers("admin2", "ADMIN");