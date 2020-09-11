/**
 * Created by horvath on 2017. 05. 19.
 */
let Item = require('../models/item');
let Balance = require('../models/balance');
let auth = require('../auth/auth');

let query = (req, res) => {
    let collection = req.body.collection;
    if (!collection) {
        return res.status(400).send({success: false, msg: 'No collection provided.'});
    }
    auth.getUserAndGroup(auth.getToken(req.headers))
        .then((result) => {
            let group = result.group;
            if (collection.toLowerCase() == 'balance') {
                const year = req.body.year;
                const month = req.body.month;
                if (!year || !month) {
                    return res.status(400).send({success: false, msg: 'Missing parameters.'});
                }
                Balance.findOne({
                    group_id: group.id,
                    year: year,
                    month: month
                }, (err, balance) => {
                    if (err || !balance) {
                        return res.status(400).send({success: false, msg: 'Nincs adat.'});
                    }
                    return res.status(200).send({success: true, value: balance.amount});
                });
            }
            else if (collection.toLowerCase() == 'item') {
                const category_type = req.body.category_type;
                const description_like = req.body.description_like;
                const description = req.body.description;
                const category = req.body.category;
                const min_date = req.body.min_date;
                const max_date = req.body.max_date;
                const min_amount = req.body.min_amount;
                const max_amount = req.body.max_amount;
                if (!category_type) {
                    return res.status(400).send({success: false, msg: 'Missing parameters.'});
                }
                if (description_like == true && !description) {
                    return res.status(400).send({success: false, msg: 'Wrong parameters.'});
                }
                let query = {
                    category_type: category_type.toUpperCase(),
                    group_id: group.id
                };
                if (category) {
                    query.category = category.toUpperCase();
                }
                let minDate = min_date ? min_date : new Date(2000, 1, 1);
                let maxDate = max_date ? max_date : new Date(2100, 11, 30);
                query.date = {
                    $gte: minDate,
                    $lte: maxDate
                };
                let minAmount = min_amount ? min_amount : 0;
                let maxAmount = max_amount ? max_amount : 100000000;
                query.amount = {
                    $gte: minAmount,
                    $lte: maxAmount
                };
                if (description_like == 'true') {
                    query.description = new RegExp(description, "i");
                }
                else if (description) {
                    query.description = description;
                }
                Item.find(query, (err, items) => {
                    if (err) {
                        return res.status(500).send({success: false, msg: 'Error when retrieving items.'});
                    }
                    if (!items) {
                        return res.status(200).send({success: false, value: 0});
                    }
                    let sum = 0;
                    items.forEach((item) => {
                        sum += item.amount;
                    });
                    return res.status(200).send({success: true, value: sum, numberOfItems: items.length});
                });
            }
            else {
                return res.status(400).send({success: false, msg: 'Collection not found.'});
            }
        })
        .catch((err) => {
            res.status(403).send({success: false, msg: err.message});
        });
};

module.exports = {
    query,
};
