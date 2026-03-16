const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../models/user');
const Group = require('../models/group');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const getTransporter = () => transporter;

// Generates a secure random token, persists it on the User record,
// and sends a verification email. Returns a Promise.
// The caller is responsible for sending the HTTP response.
const sendMail = async (email, host) => {
  const token = crypto.randomBytes(32).toString('hex');
  await User.findOneAndUpdate({ email }, { verification_token: token });
  const link = `https://${host}/api/verify?id=${token}`;
  await transporter.sendMail({
    from: 'Cost App',
    to: email,
    subject: 'email-cím megerősítése',
    html: `Hello,<br> Kérlek kattints a linkre, hogy megerősítsd az email-címedet.<br><a href="${link}">Kattints ide</a>`,
  });
};

// Handles GET /api/verify?id=TOKEN
const verify = async (req, res) => {
  const token = req.query.id;
  if (!token) {
    return res.status(400).send({ success: false, message: 'Missing token.' });
  }
  const user = await User.findOne({ verification_token: token });
  if (!user) {
    return res.status(404).send({ success: false, msg: 'User not found or token expired.' });
  }
  const group = await Group.findById(user.group_id);
  if (!group) {
    return res.status(404).send({ success: false, msg: 'Group not found.' });
  }
  user.verification_token = undefined;
  if (group.admin && group.admin.equals(user._id)) {
    user.account_type = 'ACKNOWLEDGED';
    await user.save();
    return res.status(200).send({
      email: user.email,
      message: `A(z) ${user.email} címet sikeresen megerősítetted. Te vagy a csoport adminisztrátora.`,
    });
  }
  user.account_type = 'CONFIRMED';
  group.pending_requests.push(user._id);
  await group.save();
  await user.save();
  return res.status(200).send({
    email: user.email,
    message: `A(z) ${user.email} címet sikeresen megerősítetted. Várj, amíg az admin elfogadja a csatlakozási kérésedet!`,
  });
};

module.exports = { sendMail, verify, getTransporter };
