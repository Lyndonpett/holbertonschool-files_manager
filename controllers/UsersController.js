const sha1 = require('sha1');
const { ObjectID } = require('mongodb');
const Redis = require('../utils/redis');
const dbClient = require('../utils/db');

const users = dbClient.db.collection('users');

class UsersController {
  static postNew(req, res) {
    (async () => {
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

  static getMe(req, res) {
    (async () => {
      const header = req.headers['x-token'];
      const key = `auth_${header}`;
      const redDiss = await Redis.get(key);
      if (redDiss) {
        const userId = new ObjectID(redDiss);
        const user = await users.findOne({ _id: userId });
        return res.json({ id: redDiss, email: user.email });
      }
      return res.status(401).json({ error: 'Unauthorized' });
    })();
  }
}

module.exports = UsersController;
