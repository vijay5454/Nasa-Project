const mongoose = require('mongoose');

const planetSchema = new mongoose.Schema({
    kepler_name: {
        type: String,
        require: true,
    }
});

//Connecting Created planetSchema using mongoose with MongoDB
//"Planet" will be converted to "planets" by lowercasing and pluralised by MongoDB and make it as collection
//name
module.exports = mongoose.model('Planet', planetSchema);