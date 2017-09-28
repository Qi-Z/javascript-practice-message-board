var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({

    'username': {type:String, required: true},
    'password': {type: String, required: true},
    'firstname': String,
    'lastname': String,
    'location': String,
    'email': String,
    'gender': String,
    'phone': String,
    'messages': [
        {
            'from': {type: String, required: true},
            'to': {type: String, required: true},
            'title': String,
            'description': String,
            'dateCreated': {type: Date, default: Date.now},
            'isImportant': {type:Boolean, default: false}
        }
    ]

});

module.exports = mongoose.model('User', UserSchema);