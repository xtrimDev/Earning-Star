const Settings = require("./model/settings");

require("dotenv").config();

async function insertIfNotExists(query, document) {
    try {
        const existingDocument = await Settings.findOne(query);

        if (!existingDocument) {
            const newDocument = new Settings(document);

            await newDocument.save();

            return {
                type: 1,
                message: "successfully saved"
            }
        }

    } catch (error) {
        console.error('Error occurred:', error);
    }
}

let setSetting = [
    {
        settingType: 'Withdrawal Amount',
        settingValue: process.env.WITHDRAWAL_AMT
    },
    {
        settingType: 'Default spins',
        settingValue: process.env.DEFAULT_SPINS
    },
    {
        settingType: 'Withdrawal Status',
        settingValue: 1
    }
];

async function insertSettings(settings) {
    await Promise.all(settings.map(list => {
        const query = { settingType: list.settingType };
        return insertIfNotExists(query, list);
    }));
}

const withdrawalAmount = async () => {
    await insertSettings(setSetting);

    try {
        const result = await Settings.findOne({ settingType: "Withdrawal Amount" });
        if (result) {
            return result.settingValue;
        } else {
            return process.env.WITHDRAWAL_AMT;
        }
    } catch (error) {
        return process.env.WITHDRAWAL_AMT;
    }
};

const DefaultSpins = async () => {
    await insertSettings(setSetting);

    try {
        const result = await Settings.findOne({ settingType: "Default spins" });
        if (result) {
            return result.settingValue;
        } else {
            return process.env.DEFAULT_SPINS;
        }
    } catch (error) {
        return process.env.DEFAULT_SPINS;
    }
};

const withdrawalStatus = async () => {
    await insertSettings(setSetting);

    try {       
        const result = await Settings.findOne({ settingType: "Withdrawal Status" });
        if (result) {
            return result.settingValue;
        } else {
            return 1;
        }
    } catch (error) {
        return 1;
    }
};

module.exports = { withdrawalAmount, DefaultSpins, withdrawalStatus };
