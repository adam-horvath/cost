/**
 * Created by horvath on 2017. 05. 17.
 */
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

// for storing the balance history by month
let BalanceSchema = new Schema({
    group_id: {
        type: Schema.Types.ObjectId,
        ref: 'group',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    year: {
        type: Number,
        min: 2000,
        max: 2100,
        required: true
    },
    month: {
        type: Number,
        min: 0,
        max: 11,
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Balance', BalanceSchema);
