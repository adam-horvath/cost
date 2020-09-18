/**
 * Created by horvath on 2017. 08. 16.
 */

let Item = require("../models/item");
let Balance = require("../models/balance");
let auth = require("../auth/auth");

let getChartData = (req, res) => {
    if (!req.body.category_types && !req.body.categories) {
        return res
            .status(400)
            .send({ success: false, msg: "Missing parameters." });
    }
    auth
        .getUserAndGroup(auth.getToken(req.headers))
        .then(authResult => {
            let group = authResult.group;
            const categoryTypes = req.body.category_types
                ? req.body.category_types.split(",")
                : [];
            const categories = req.body.categories
                ? req.body.categories.split(",")
                : [];
            const minMonth = req.body.min_month || 0;
            const maxMonth = req.body.max_month || 11;
            let minDate = {
                year: req.body.min_year,
                month: minMonth
            };
            if (
                !minDate.year ||
                minDate.year < 2015 ||
                (minDate.year == 2015 && minDate.month < 9)
            ) {
                minDate = {
                    year: 2015,
                    month: 9
                };
            }
            let maxDate = {
                year: req.body.max_year,
                month: maxMonth
            };
            const now = new Date();
            if (
                !maxDate.year ||
                maxDate.year > now.getFullYear() ||
                (maxDate.year == now.getFullYear() &&
                    maxDate.month > now.getMonth())
            ) {
                maxDate = {
                    year: now.getFullYear(),
                    month: now.getMonth()
                };
            }
            let months = [];
            let i = minDate;
            while (
                i.year < maxDate.year ||
                (i.year == maxDate.year && i.month <= maxDate.month)
            ) {
                months.push(i);
                i = getNextMonth(i.year, i.month);
            }
            let tasksToGo =
                months.length * (categories.length + categoryTypes.length);
            let onComplete = resultObj => {
                return res
                    .status(200)
                    .send({ success: true, result: resultObj });
            };
            let result = {};
            for (let category of categories) {
                result[category] = [];
                for (let monthObj of months) {
                    let query = {
                        group_id: group.id,
                        year: monthObj.year,
                        month: monthObj.month,
                        category: category,
                        category_type: "COST"
                    };
                    Item.find(query, (err, items) => {
                        if (err) {
                            return res
                                .status(500)
                                .send({
                                    success: false,
                                    msg: "Error when retrieving items."
                                });
                        }
                        let sum = 0;
                        items.forEach(item => {
                            sum += item.amount;
                        });
                        result[category].push({
                            [monthObj.year + "_" + monthObj.month]: sum
                        });
                        if (--tasksToGo === 0) {
                            onComplete(result);
                        }
                    });
                }
            }
            for (let categoryType of categoryTypes) {
                result[categoryType] = [];
                if (categoryType === "BALANCE") {
                    const prev = getPreviousMonth(months[0].year, months[0].month);
                    let query = {
                        group_id: group.id,
                        year: prev.year,
                        month: prev.month,
                    };
                    Balance.findOne(query, (err, balance) => {
                        if (err) {
                            return res
                            .status(500)
                            .send({
                                success: false,
                                msg: "Error when retrieving items."
                            });
                        }
                        result['PREV_BALANCE'] = balance && balance.amount ? balance.amount : 0;
                        for (let monthObj of months) {
                            Item.find({
                                group_id: group.id,
                                year: monthObj.year,
                                month: monthObj.month,
                                category_type: "COST"
                            }, (err, costItems) => {
                                if (err) {
                                    return res
                                    .status(500)
                                    .send({
                                        success: false,
                                        msg: "Error when retrieving cost items."
                                    });
                                }
                                Item.find({
                                    group_id: group.id,
                                    year: monthObj.year,
                                    month: monthObj.month,
                                    category_type: "INCOME"
                                }, (err, incomeItems) => {
                                    if (err) {
                                        return res
                                        .status(500)
                                        .send({
                                            success: false,
                                            msg: "Error when retrieving income items."
                                        });
                                    }
                                    let sumCost = 0;
                                    costItems.forEach(item => {
                                        sumCost += item.amount;
                                    });
                                    let sumIncome = 0;
                                    incomeItems.forEach(item => {
                                        sumIncome += item.amount;
                                    });
                                    result[categoryType].push({
                                        [monthObj.year + "_" + monthObj.month]: sumIncome - sumCost,
                                    });
                                    if (--tasksToGo === 0) {
                                        onComplete(result);
                                    }
                                });
                            });
                        }
                    });
                } else {
                    for (let monthObj of months) {
                        let query = {
                            group_id: group.id,
                            year: monthObj.year,
                            month: monthObj.month,
                            category_type: categoryType
                        };
                        Item.find(query, (err, items) => {
                            if (err) {
                                return res
                                    .status(500)
                                    .send({
                                        success: false,
                                        msg: "Error when retrieving items."
                                    });
                            }
                            let sum = 0;
                            items.forEach(item => {
                                sum += item.amount;
                            });
                            result[categoryType].push({
                                [monthObj.year + "_" + monthObj.month]: sum
                            });
                            if (--tasksToGo === 0) {
                                onComplete(result);
                            }
                        });
                    }
                }
            }
        })
        .catch(err => {
            res.status(403).send({ success: false, msg: err.message });
        });
};

let getNextMonth = (year, month) => {
    if (month == 11) {
        year++;
        return {
            year: year,
            month: 0
        };
    }
    month++;
    return {
        year: year,
        month: month
    };
};

let getPreviousMonth = (year, month) => {
    if (month == 0) {
        year--;
        return {
            year,
            month: 11,
        };
    }
    month--;
    return {
        year,
        month,
    };
};

module.exports = {
    getChartData
};
