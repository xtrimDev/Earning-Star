const mongoose = require("mongoose");
require("dotenv").config();

const dbConnect = async () => {
    try {
        await mongoose.connect(`mongodb+srv://xtrimDev:QXMEo7PqKe3252ur@winzyluckey.fc2thwh.mongodb.net/`);
        // await mongoose.connect(`mongodb://localhost:27017/${process.env.DB_NAME}`);
        console.log(`Connected to database Successfully.`);
    } catch(e) {
        console.log("Error connecting to the database.");
        console.log(e);
    } 
}

dbConnect();
