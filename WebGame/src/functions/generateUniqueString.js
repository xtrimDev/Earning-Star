function generateUniqueString(length) {
    const characters = 'IsazAGPjXngHrfu8V1lwZLmOeYdq06TpSxkJhW9RtcMDoKbUQ3NC27v54BiFEy';
    let result = '';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

module.exports = generateUniqueString;