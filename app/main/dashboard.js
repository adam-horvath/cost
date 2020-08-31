/**
 * Created by horvath on 2017. 05. 08.
 */
let User = require('../models/user'); // get the mongoose model
let Item = require('../models/item');
let Balance = require('../models/balance');
let auth = require('../auth/auth');
let url = require('url');
//
// let hack = (req, res) => {
//     Item.find({}, (err, items) => {
//         for (let item of items) {
//             const date = new Date(item.date);
//             date.setHours(6);
//             item.date = date;
//             item.save((err) => {
//                 if (err) {
//                     return res.status(500).send({error: err});
//                 }
//                 return res.status(200).send({success: true});
//             });
//         }
//     });
// };

let getMainDashboard = (req, res) => {
    auth.getUserAndGroup(auth.getToken(req.headers))
        .then((result) => {
            let user = result.user;
            let group = result.group;
            // get data for main screen
            let date = req.body.date ? new Date(req.body.date) : new Date();
            let year = date.getFullYear();
            let month = date.getMonth();
            let day = date.getDate();
            // get items of the given day
            Item.find({
                group_id: group.id,
                year: year,
                month: month,
                day: day
            }, (err, itemsOfDay) => {
                if (err) {
                    console.log(5000, err.message);
                    return res.status(404).send({success: false, msg: 'Item not found.'});
                }
                // get items in the given month
                Item.find({
                    group_id: group.id,
                    year: year,
                    month: month
                }, (err, itemsOfMonth) => {
                    if (err) {
                        console.log(5001, err.message);
                        throw err;
                    }
                    let totalCost = 0;
                    let totalIncome = 0;
                    itemsOfMonth.forEach((item) => {
                        if (item.category_type == 'INCOME') {
                            totalIncome += item.amount;
                        }
                        else {
                            totalCost += item.amount;
                        }
                    });
                    let yearOfPreviousMonth = month == 0 ? year - 1 : year;
                    let previousMonth = month == 0 ? 11 : month - 1;
                    Balance.findOne({
                        group_id: group.id,
                        year: yearOfPreviousMonth,
                        month: previousMonth
                    }, (err, previousBalance) => {
                        if (err) {
                            console.log(5002, err.message);
                            return res.status(404).send({success: false, msg: 'Balance not found.'});
                        }
                        let previousAmount = 0;
                        if (previousBalance && previousBalance.amount) {
                            previousAmount = previousBalance.amount;
                        }
                        let balance = previousAmount + totalIncome - totalCost;
                        let tasksToGo = group.pending_requests.length;
                        let onComplete = (users, isAdmin) => {
                            if (isAdmin) {
                                return res.status(200).send({
                                    items: itemsOfDay,
                                    pending_requests: users,
                                    balance: balance
                                });
                            }
                            else {
                                return res.status(200).send({
                                    items: itemsOfDay,
                                    balance: balance
                                });
                            }
                        };
                        // if the user is not the group admin
                        if (group.admin != user.id) {
                            onComplete(null, false)
                        }
                        // if no pending requests are in the queue
                        if (group.admin == user.id && tasksToGo === 0) {
                            onComplete([], true);
                        }
                        let pendingUsers = [];
                        group.pending_requests.forEach((userId) => {
                            User.findById(userId, (err, pendingUser) => {
                                pendingUsers.push(pendingUser.email);
                                if (--tasksToGo === 0) {
                                    onComplete(pendingUsers, true);
                                }
                            });
                        });
                    });
                });
            });
        })
        .catch((err) => {
            console.log(5003, err.message);
            return res.status(403).send({success: false, msg: err.message});
        });
};

let getStats = (req, res) => {
    auth.getUserAndGroup(auth.getToken(req.headers))
        .then((result) => {
            let group = result.group;
            // get data for main screen
            let date = req.body.date ? new Date(req.body.date) : new Date();
            let year = date.getFullYear();
            let month = date.getMonth();
            let day = date.getDate();
            let daysInMonth = new Date(year, month + 1, 0).getDate();
            // get items in the given month
            Item.find({
                group_id: group.id,
                year: year,
                month: month
            }, (err, itemsOfMonth) => {
                if (err) {
                    console.log(9001, err.message);
                    throw err;
                }
                let totalCost = 0;
                let totalCostWithoutHouse = 0;
                let generalCost = 0;
                let costOnceOfThisMonth = 0;
                let totalIncome = 0;
                itemsOfMonth.forEach((item) => {
                    if (item.category_type == 'INCOME') {
                        totalIncome += item.amount;
                    }
                    else {
                        totalCost += item.amount;
                        if (item.category != 'HOUSE') {
                            totalCostWithoutHouse += item.amount;
                        }
                        if (item.category != 'HOUSE' && item.category != 'INVESTMENT' && item.category != 'PHONE') {
                            generalCost += item.amount;
                        }
                        if (item.category == 'HOUSE' || item.category == 'INVESTMENT' || item.category == 'PHONE') {
                            costOnceOfThisMonth += item.amount;
                        }
                    }
                });
                let yearOfPreviousMonth = month == 0 ? year - 1 : year;
                let previousMonth = month == 0 ? 11 : month - 1;
                Balance.findOne({
                    group_id: group.id,
                    year: yearOfPreviousMonth,
                    month: previousMonth
                }, (err, previousBalance) => {
                    if (err) {
                        console.log(9002, err.message);
                        return res.status(404).send({success: false, msg: 'Balance not found.'});
                    }
                    let costOnceOfPreviousMonth = 0;
                    Item.find({
                        group_id: group.id,
                        category_type: 'COST',
                        year: yearOfPreviousMonth,
                        month: previousMonth
                    }, (error, itemsOfPreviousMonth) => {
                        if (error) {
                            console.log(90027, error.message);
                            return res.status(404).send({msg: 'Items are not found.'});
                        }
                        itemsOfPreviousMonth.forEach((item) => {
                            if (item.category == 'HOUSE' || item.category == 'INVESTMENT' || item.category == 'PHONE') {
                                costOnceOfPreviousMonth += item.amount;
                            }
                        });
                        let previousAmount = 0;
                        if (previousBalance && previousBalance.amount) {
                            previousAmount = previousBalance.amount;
                        }
                        let balance = previousAmount + totalIncome - totalCost;
                        let balanceInMonth = totalIncome - totalCost;
                        let endInstantOfMonth = new Date(year, month + 1, 0);
                        let quotient = new Date() < endInstantOfMonth ? day : daysInMonth;
                        let dailyAverage = totalCost / quotient;
                        let dailyAverageWithoutHouse = totalCostWithoutHouse / quotient;
                        let dailyAverageOfGeneralCost = generalCost / quotient;
                        let costOnce = costOnceOfPreviousMonth > costOnceOfThisMonth ? costOnceOfPreviousMonth : costOnceOfThisMonth;
                        let expectedCost = isThisMonth(year, month) ? dailyAverageOfGeneralCost * daysInMonth + costOnce : totalCost;
                        let expectedBalance = previousAmount + totalIncome - expectedCost;
                        let expectedBalanceInMonth = totalIncome - expectedCost;
                        return res.status(200).send({
                            balance: balance,
                            total_income: totalIncome,
                            total_cost: totalCost,
                            daily_average: dailyAverage,
                            daily_average_without_house: dailyAverageWithoutHouse,
                            balance_in_month: balanceInMonth,
                            expected_cost: expectedCost,
                            expected_balance_in_month: expectedBalanceInMonth,
                            expected_balance: expectedBalance
                        });
                    });
                });
            });
        })
        .catch((err) => {
            console.log(9003, err.message);
            return res.status(403).send({success: false, msg: err.message});
        });
};

let deleteItem = (req, res) => {
    let pathParts = url.parse(req.url).pathname.split('/');
    let itemId = pathParts[3];
    if (!itemId) {
        console.log(5004, 'No item provided.');
        return res.status(400).send({success: false, msg: 'No item provided.'});
    }
    auth.getUserAndGroup(auth.getToken(req.headers))
        .then((result) => {
            let group = result.group;
            // find item
            Item.findById(itemId, (err, item) => {
                if (err) {
                    console.log(50055, 'Item not found.');
                    return res.status(403).send({success: false, msg: 'A törölni kívánt tétel nem található.'});
                }
                // check authorization
                if (item.group_id != group.id) {
                    console.log(5005, 'Authorization failed (delete item from another group).');
                    return res.status(403).send({success: false, msg: 'Authorization failed (delete item from another group).'});
                }
                Item.findByIdAndRemove(item.id, (err, deletedItem) => {
                    if (err) {
                        console.log(5006, err.message);
                        return res.status(500).send({success: false, msg: err.message});
                    }
                    // modify balance information
                    Balance.find({
                        group_id: group.id,
                        date: {
                            $gte: new Date(item.year, item.month, 1, 0)
                        }
                    }, (err, balances) => {
                        if (err) {
                            console.log(5007, err.message);
                            throw err;
                        }
                        let factor = -1;
                        if (item.category_type == 'INCOME') {
                            factor = 1;
                        }
                        let change = item.amount * factor;
                        const writePromises = balances.map((balance) => {
                            return new Promise((resolve, reject) => {
                                balance.amount -= change;
                                balance.save((err) => {
                                    if (err) {
                                        console.log(5008, 'Could not find balance.');
                                        return reject('Could not find balance.');
                                    }
                                    return resolve();
                                });
                            });
                        });
                        Promise.all(writePromises)
                            .then(() => {
                                console.log(5009, 'Item deleted.');
                                return res.status(200).send({success: true, msg: 'Tétel törölve.'});
                            });
                    });
                })
            });
        })
        .catch((err) => {
            console.log(5010, err.message);
            return res.status(403).send({success: false, msg: err.message});
        });
};

let updateItem = (req, res) => {
    let newItem = req.body;
    if (!newItem || !newItem.id || !newItem.amount || !newItem.category || !newItem.category_type || !newItem.date) {
        console.log(5011, 'No item provided');
        return res.status(400).send({success: false, msg: 'No item provided.'});
    }
    auth.getUserAndGroup(auth.getToken(req.headers))
        .then((result) => {
            let group = result.group;
            Item.findById(newItem.id, (err, item) => {
                if (err || !item) {
                    console.log(5012, 'Item not found.');
                    return res.status(404).send({success: false, msg: 'Item not found.'});
                }
                // check authorization
                if (item.group_id != group.id) {
                    console.log(5013, 'Authorization failed (update item from another group).');
                    return res.status(403).send({success: false, msg: 'Authorization failed (update item from another group).'});
                }
                // modifying the month of date is forbidden!
                // use delete and create instead!
                let newDate = new Date(newItem.date);
                let newYear = newDate.getFullYear();
                let newMonth = newDate.getMonth();
                let newDay = newDate.getDate();
                if (newYear != item.year || newMonth != item.month) {
                    console.log(5014, 'Do not modify the month, use delete and create instead!');
                    return res.status(400).send({success: false, msg: 'Do not modify the month, use delete and create instead!'});
                }
                let isModifiedAmount = false;
                if (item.amount != newItem.amount) {
                    isModifiedAmount = true;
                }
                let oldAmount = item.amount;
                item.amount = newItem.amount;
                item.category = newItem.category;
                item.category_type = newItem.category_type;
                if (newItem.description) {
                    item.description = newItem.description;
                }
                item.date = newDate;
                item.day = newDay;
                item.save((err) => {
                    if (err) {
                        console.log(5015, err.message);
                        return res.status(404).send({success: false, msg: 'Error while saving item.'});
                    }
                    // if some balances have to be modified
                    if (isModifiedAmount) {
                        // modify balance information
                        Balance.find({
                            group_id: group.id,
                            date: {
                                $gte: new Date(item.year, item.month, 1, 0)
                            }
                        }, (err, balances) => {
                            if (err) {
                                console.log(5016, err.message);
                                throw err;
                            }
                            let factor = -1;
                            if (item.category_type == 'INCOME') {
                                factor = 1;
                            }
                            let change = (newItem.amount - oldAmount) * factor;
                            const writePromises = balances.map((balance) => {
                                return new Promise((resolve, reject) => {
                                    balance.amount += change;
                                    balance.save((err) => {
                                        if (err) {
                                            console.log(5017, 'Could not find balance.');
                                            return reject('Could not find balance.');
                                        }
                                        return resolve();
                                    });
                                });
                            });
                            Promise.all(writePromises)
                                .then(() => {
                                    console.log(5018, 'Item saved with new amount.');
                                    return res.status(200).send({success: true, msg: 'Sikeres mentés új összeggel.'});
                                });
                        });
                    }
                    else {
                        console.log(5019, 'Item saved without amount change.');
                        return res.status(200).send({success: true, msg: 'Sikeres mentés az összeg módosítása nélkül.'});
                    }
                });
            });
        })
        .catch((err) => {
            console.log(5020, err.message);
            return res.status(403).send({success: false, msg: err.message});
        });
};

let addItem = (req, res) => {
    let input = req.body;
    if (!input || !input.amount || !input.category || !input.category_type || !input.date) {
        console.log(5021, 'No item provided.');
        return res.status(400).send({success: false, msg: 'No item provided.'});
    }
    auth.getUserAndGroup(auth.getToken(req.headers))
        .then((result) => {
            let group = result.group;
            let date = new Date(input.date);
            let item = new Item({
                group_id: group.id,
                amount: input.amount,
                category: input.category,
                category_type: input.category_type,
                date: date,
                year: date.getFullYear(),
                month: date.getMonth(),
                day: date.getDate()
            });
            if (input.description) {
                item.description = input.description;
            }
            item.save((err) => {
                if (err) {
                    console.log(5022, err.message);
                    return res.status(500).send({success: false, msg: err.message});
                }
                let factor = -1;
                // update balance document(s)
                if (item.category_type == 'INCOME') {
                    factor = 1;
                }
                let change = item.amount * factor;
                let init = {
                    year: item.year,
                    month: item.month
                };
                Promise.all(getPromises(init, group.id))
                    .then((result) => {
                        const writePromises = result.map((balance) => {
                            return new Promise((resolve, reject) => {
                                balance.amount += change;
                                balance.save((err) => {
                                    if (err) {
                                        console.log(err);
                                        console.log(5023, 'Could not find balance.');
                                        return reject('Could not find balance.');
                                    }
                                    return resolve();
                                });
                            });
                        });
                        Promise.all(writePromises)
                            .then(() => {
                                console.log(5024, 'Item saved.');
                                return res.status(200).send({success: true, msg: 'Sikeres mentés!'});
                            });
                    })
                    .catch((err) => {
                        console.log(5025, err.message);
                        return res.status(500).send({success: false, msg: err.message});
                    });
            });
        })
        .catch((err) => {
            console.log(5026, err.message);
            return res.status(403).send({success: false, msg: err.message});
        });
};

let getPromises = (monthObj, groupId) => {
    const promise = new Promise((resolve, reject) => {
        Balance.findOne({
            group_id: groupId,
            year: monthObj.year,
            month: monthObj.month
        }, (err, balance) => {
            if (err) {
                return reject('Could not find balance...');
            }
            if (!balance) {
                const previousMonthObj = getPreviousMonth(monthObj.year, monthObj.month);
                Balance.findOne({
                    group_id: groupId,
                    year: previousMonthObj.year,
                    month: previousMonthObj.month
                }, (err, previousBalance) => {
                    if (err) {
                        return reject('Could not find balance...');
                    }
                    if (!previousBalance) {
                        previousBalance = new Balance({
                            group_id: groupId,
                            date: new Date(monthObj.year, monthObj.month, 1, 2),
                            year: monthObj.year,
                            month: monthObj.month,
                            amount: 0
                        });
                    }
                    const res = new Balance({
                        group_id: previousBalance.group_id,
                        date: new Date(monthObj.year, monthObj.month, 1, 2),
                        year: monthObj.year,
                        month: monthObj.month,
                        amount: previousBalance.amount
                    });
                    return resolve(res);
                });

            }
            else {
                return resolve(balance);
            }
        });
    });
    const nextMonthObj = getNextMonth(monthObj.year, monthObj.month);
    let today = new Date();
    if (nextMonthObj.year < today.getFullYear() || nextMonthObj.year == today.getFullYear() && nextMonthObj.month <= today.getMonth()) {
        const promises = getPromises(nextMonthObj, groupId);
        promises.push(promise);
        return promises;
    } else {
        return [promise];
    }
};

let getNextMonth = (year, month) => {
    if (month == 11) {
        year++;
        return {
            year: year,
            month: 0
        }
    }
    month++;
    return {
        year: year,
        month: month
    }
};

let getPreviousMonth = (year, month) => {
    if (month == 0) {
        year--;
        return {
            year: year,
            month: 11
        }
    }
    month--;
    return {
        year: year,
        month: month
    }
};

const isThisMonth = (year, month) => {
    const date = new Date();
    return date.getFullYear() === year && date.getMonth() === month;
}

module.exports = {
    getMainDashboard,
    addItem,
    deleteItem,
    updateItem,
    getStats,
};
