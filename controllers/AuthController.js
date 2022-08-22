const sha1 = require('sha1');
const { v4: uuid } = require('uuid');
const Redis = require('../utils/redis');
const DB = require('../utils/db');

const users = DB.db.collection('users');

class AuthController {
  static getConnect(req, res) {
    (async () => {
      const header = req.headers.authorization;
      const newBuffer = Buffer.from(header.split(6), 'base64');
      const [email, password] = newBuffer.toString('utf-8').split(':');

      if (!password) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await users.findOne({ email, password: sha1(password) });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const token = uuid();
      const key = `auth_${token}`;
      await Redis.set(key, user._id.toString(), 86400);
    })();
  }

  static getDisconnect(req, res) {
    (async () => {
      const header = req.headers.['x-token'];
      const key = `auth_${header}`;
      if (await Redis.get(key)) {
        await Redis.del(key);
        return res.sendStatus(204);
      }
      return res.status(401).json({ error: 'Unauthorized' });
    })();
  }
}

module.exports = AuthController;
