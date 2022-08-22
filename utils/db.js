const { MongoClient } = require('mongodb');

const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || '27017';
const database = process.env.DB_DATABASE || 'test';
const url = `mongodb://${host}:${port}/${database}`;

class DBClient {
  constructor() {
    MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
      if (err) {
        console.log(err);
        this.db = false;
      }
      this.db = client.db(database);
      this.users = this.db.collection('users');
      this.files = this.db.collection('files');
    });
  }

  isAlive() {
    if (this.db) {
      return true;
    }
    return false;
  }

  async nbUsers() {
    try {
      return this.users.countDocuments();
    } catch (err) {
      console.log(err);
      return 0;
    }
  }

  async nbFiles() {
    try {
      return this.files.countDocuments();
    } catch (err) {
      console.log(err);
      return 0;
    }
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
