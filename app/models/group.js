/**
 * Created by horvath on 2017. 05. 10.
 */
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

// set up a mongoose model
let GroupSchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    admin: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    pending_requests: [{
        type: Schema.Types.ObjectId,
        ref: 'user'
    }]
});

module.exports = mongoose.model('Group', GroupSchema);
