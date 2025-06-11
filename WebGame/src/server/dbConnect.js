const mongoose = require("mongoose");
require("dotenv").config();

const dbConnect = async () => {
    try {
        await mongoose.connect(`${process.env.DB_URL}`);
        console.log(`Connected to database Successfully.`);
    } catch(e) {
        console.log("Error connecting to the database.");
        console.log(e);
    } 
}

dbConnect();
