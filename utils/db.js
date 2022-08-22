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
        this.db = null;
      }
      this.db = client.db(database);
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
      return this.db.collection('users').count();
    } catch (err) {
      console.log(err);
      return 0;
    }
  }

  async nbFiles() {
    try {
      return this.db.collection('files').count();
    } catch (err) {
      console.log(err);
      return 0;
    }
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
