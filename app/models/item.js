/**
 * Created by horvath on 2017. 05. 10.
 */
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

// set up a mongoose model
let ItemSchema = new Schema({
    group_id: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    amount: {
        type: Number,
        min: 1,
        required: true
    },
    category: {
        type: String,
        enum: [
            'SALARY', //INCOME
            'STATE', //INCOME
            'GIFT', //CAN BE BOTH
            'LOAN', //CAN BE BOTH
            'OTHER', //CAN BE BOTH
            'BANK', //COSTS FROM HERE...
            'CAR',
            'CLOTHES',
            'DRINK',
            'FOOD',
            'GROCERY',
            'HOUSE',
            'INSURANCE',
            'INVESTMENT', // CAN BE BOTH
            'LUXURY',
            'OVERHEAD', // rezsi
            'PHARMACY',
            'PHONE',
            'TRAVEL'
        ],
        required: true
    },
    category_type: {
        type: String,
        enum: ['INCOME', 'COST'],
        required: true
    },
    description: {
        type: String
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
    day: {
        type: Number,
        min: 1,
        max: 31,
        required: true
    }
});

module.exports = mongoose.model('Item', ItemSchema);
