require("dotenv").config();

const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://xtrimDev:QXMEo7PqKe3252ur@winzyluckey.fc2thwh.mongodb.net/";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: false } });

const db = client.db(process.env.DB_NAME)
client.connect();

const updateChannelJoined = async (channelUsername, _id) => {
  try {
    const query = {
      _id,
      'taskComplete': { channelName: channelUsername }
    };

    const existingDocument = await db.collection("users").findOne(query);

    if (!existingDocument) {
      const result = await db.collection("users").updateOne(
        { _id },
        { $push: { 'taskComplete': { channelName: channelUsername } } }, 
        {
          upsert: true
        }
      );
      return {
        type: 1,
        message: "successfully saved"
      }
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports = { updateChannelJoined };
