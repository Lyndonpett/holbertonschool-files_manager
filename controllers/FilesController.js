const { v4: uuid } = require('uuid');
const mongo = require('mongodb');
const fs = require('fs');
const Redis = require('../utils/redis');
const dbClient = require('../utils/db');

class FilesController {
  static postUpload(req, res) {
    (async () => {
      const token = req.headers['x-token'];
      const key = await Redis.get(`auth_${token}`);

      if (!key) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { name, type, data, isPublic = false, parentId = 0 } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Missing name' });
      }

      if (!type) {
        return res.status(400).json({ error: 'Missing type' });
      }

      if (!data && type !== 'folder') {
        return res.status(400).json({ error: 'Missing data' });
      }

      if (parentId !== 0) {
        const project = new mongo.ObjectID(parentId);
        const file = await dbClient.db
          .collection('files')
          .findOne({ _id: project });

        if (!file) {
          return res.status(400).json({ error: 'Parent not found' });
        }

        if (file && file.type !== 'folder') {
          return res.status(400).json({ error: 'Parent is not a folder' });
        }
      }

      let newFile;
      if (type === 'folder') {
        newFile = await dbClient.db.collection('files').insertOne({
          userId: new mongo.ObjectId(key),
          name,
          type,
          isPublic,
          parentId,
        });
      } else {
        const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

        if (!fs.existsSync(FOLDER_PATH)) {
          fs.mkdirSync(FOLDER_PATH);
        }

        const filePath = `${FOLDER_PATH}/${uuid()}`;
        const decode = Buffer.from(data, 'base64').toString('utf-8');

        await fs.promises.writeFile(filePath, decode);

        newFile = await dbClient.db.collection('files').insertOne({
          userId: new mongo.ObjectId(key),
          name,
          type,
          isPublic,
          parentId,
          filePath,
        });
      }

      return res.status(201).send({
        id: newFile.insertedId,
        userId: key,
        name,
        type,
        isPublic,
        parentId,
      });
    })().catch((err) => {
      console.log(err);
      return res.status(500).json({ error: err.toString() });
    });
  }
}

module.exports = FilesController;
