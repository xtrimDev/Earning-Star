const mongoose = require("mongoose");

const dbClose = async () => {
    try {
        await mongoose.connection.close();
        console.log(`Database closed Successsfully.`);
    } catch(e) {
        console.log("Error while closing the database.");
        console.log(e);
    } 
}

dbClose();