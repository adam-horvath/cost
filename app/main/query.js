const escapeStringRegexp = require("escape-string-regexp");
const Item = require("../models/item");
const Balance = require("../models/balance");
const auth = require("../auth/auth");

// Builds a validated Mongoose query object from request body params.
// Returns null if required params are missing.
const buildItemQuery = (group, body) => {
    const {
        category_type,
        description_like,
        description,
        category,
        exclude_category,
        min_date,
        max_date,
        min_amount,
        max_amount,
    } = body;
    if (!category_type) return null;
    if (description_like === "true" && !description) return null;
    const q = {
        category_type: category_type.toUpperCase(),
        group_id: group.id,
    };
    if (category) {
        q.category = exclude_category
            ? { $ne: category.toUpperCase() }
            : category.toUpperCase();
    }
    q.date = {
        $gte: min_date ? new Date(min_date) : new Date(2000, 1, 1),
        $lte: max_date ? new Date(max_date) : new Date(2100, 11, 30),
    };
    q.amount = {
        $gte: min_amount || 0,
        $lte: max_amount || 100000000,
    };
    if (description_like === "true") {
        // escape user input before constructing a RegExp to prevent ReDoS
        q.description = new RegExp(escapeStringRegexp(description), "i");
    } else if (description) {
        q.description = description;
    }
    return q;
};

const query = async (req, res) => {
    const collection = req.body.collection;
    if (!collection) {
        return res
            .status(400)
            .send({ success: false, msg: "No collection provided." });
    }
    const { group } = await auth.getUserAndGroup(auth.getToken(req.headers));
    if (collection.toLowerCase() === "balance") {
        const { year, month } = req.body;
        if (year === undefined || month === undefined) {
            return res
                .status(400)
                .send({ success: false, msg: "Missing parameters." });
        }
        const balance = await Balance.findOne({
            group_id: group.id,
            year,
            month,
        });
        if (!balance) {
            return res.status(400).send({ success: false, msg: "Nincs adat." });
        }
        return res.status(200).send({ success: true, value: balance.amount });
    }
    if (collection.toLowerCase() === "item") {
        const q = buildItemQuery(group, req.body);
        if (!q) {
            return res
                .status(400)
                .send({ success: false, msg: "Missing parameters." });
        }
        const items = await Item.find(q);
        const sum = items.reduce((acc, item) => acc + item.amount, 0);
        return res
            .status(200)
            .send({ success: true, value: sum, numberOfItems: items.length });
    }
    return res
        .status(400)
        .send({ success: false, msg: "Collection not found." });
};

const queryList = async (req, res) => {
    const { group } = await auth.getUserAndGroup(auth.getToken(req.headers));
    const q = buildItemQuery(group, req.body);
    if (!q) {
        return res
            .status(400)
            .send({ success: false, msg: "Missing parameters." });
    }
    const items = await Item.find(q);
    return res.status(200).send({ success: true, items });
};

module.exports = { query, queryList };
