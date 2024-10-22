const { Telegraf } = require("telegraf");
const { MongoClient, ServerApiVersion } = require('mongodb');

const bot = new Telegraf(process.env.BOT_TOKEN);

// const channel = require("./model/channel");

require("dotenv").config();

const uri = "mongodb+srv://xtrimDev:QXMEo7PqKe3252ur@winzyluckey.fc2thwh.mongodb.net/";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: false } });

const db = client.db(process.env.DB_NAME)
client.connect();

const ChannelJoinedOrNot = async (channelUsername, LoggedInUserId) => {
    try {
        let channel = `@${channelUsername}`;
        let result = await bot.telegram.getChatMember(channel, LoggedInUserId);
        if (result.status == 'left' || result.status == 'kicked') {
            return false
        } else {
            return true
        }
    } catch (error) {
        return error;
    }
};

const getChannelList = async (primary = false) => {
    try {
        if (primary == 1) {
            query = { type: 1 }; 
        } else if (primary == 2) {
            query = {};
        } else {
            query = { type: 0 }; 
        }

        const result = await db.collection("channels").find(query).toArray();

        return result || false;
    } catch (error) {
        console.error('Error fetching channel:', error); // Better to use console.error for errors
        return false;
    }
}

module.exports = { ChannelJoinedOrNot, getChannelList };



