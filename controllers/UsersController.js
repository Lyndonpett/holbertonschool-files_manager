const Redis = require('../utils/redis');
const DB = require('../utils/db');
const sha1 = require('sha1');

const users = dbClient.db.collection('users');

class UsersController {
  static postNew(req, res) {
    (async() => {
      const { email, password } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Missing email' });
      }

      if (!password) {
        return res.status(400).json({ error: 'Missing password' });
      }

      if (await users.findOne({ email })) {
        return res.status(400).json({ error: 'Already exists' });
      }

      const passwordHash = sha1(password);
      const user = { email, password: passwordHash };
      const created = await users.insertOne(user);

      return res.status(201).json({ id: created.insertedId, email });
    })();
  }
}

module.exports = UsersController;
