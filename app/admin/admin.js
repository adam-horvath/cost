const User = require('../models/user');
const Group = require('../models/group');
const auth = require('../auth/auth');
const email = require('../auth/email');

const archive = async (req, res) => {
  const { user } = await auth.getUserAndGroup(auth.getToken(req.headers));
  if (user.email !== process.env.SUPER_ADMIN_EMAIL) {
    return res.status(403).send({
      success: false,
      message: 'Az archiválást csak superadmin kérheti.',
    });
  }
  const mailOptions = {
    from: 'Cost Family',
    to: process.env.SUPER_ADMIN_EMAIL,
    subject: 'adatbázis-mentés',
    html: 'Csatolva a legfrissebb archívum.<br>',
    attachments: [
      {
        filename: 'archive.tar.gz',
        path: '/home/ubuntu/cost/cost/dump/archive.tar.gz',
      },
    ],
  };
  await email.getTransporter().sendMail(mailOptions);
  return res.status(200).send({ success: true, message: 'Message sent to superadmin.' });
};

const acknowledge = async (req, res) => {
  const { user: admin } = await auth.getUserAndGroup(auth.getToken(req.headers));
  if (!req.body?.email) {
    return res.status(400).send({ success: false, msg: 'Bad request (admin).' });
  }
  const user = await User.findOne({ email: req.body.email });
  if (!user || user.account_type !== 'CONFIRMED') {
    return res.status(400).send({ success: false, msg: 'Bad request (user).' });
  }
  const group = await Group.findById(user.group_id);
  if (!group) {
    return res.status(404).send({ success: false, msg: 'Group not found.' });
  }
  if (!group.admin.equals(admin._id)) {
    return res.status(403).send({ success: false, msg: 'Unauthorized.' });
  }
  group.pending_requests.pull(user.id);
  await group.save();
  const isAcknowledged = req.body.acknowledged === true || req.body.acknowledged === 'true';
  user.account_type = isAcknowledged ? 'ACKNOWLEDGED' : 'REJECTED';
  await user.save();
  return res.status(200).send({
    success: true,
    msg: isAcknowledged ? 'Elfogadtad a felhasználó csatlakozási kérését.' : 'A felhasználó kérését visszautasítottad.',
  });
};

const deleteUser = async (req, res) => {
  const userId = req.params.id;
  if (!userId) {
    return res.status(400).send({ success: false, msg: 'No user ID provided.' });
  }
  const { user: requirer, group: requirerGroup } = await auth.getUserAndGroup(auth.getToken(req.headers));
  const userToDelete = await User.findById(userId);
  if (!userToDelete) {
    return res.status(404).send({ success: false, msg: 'User not found.' });
  }
  const isAdmin = requirerGroup.admin?.equals(requirer._id);
  const targetInSameGroup = userToDelete.group_id.equals(requirerGroup._id);
  // Admin removing another member from their own group
  if (isAdmin && targetInSameGroup && userId !== requirer.id) {
    userToDelete.account_type = 'REJECTED';
    await userToDelete.save();
    return res.status(200).send({
      success: true,
      msg: 'A felhasználót törölted a csoportból.',
    });
  }
  // Admin deleting their own account (only allowed when alone in group)
  if (isAdmin && userId === requirer.id) {
    const groupMembers = await User.find({ group_id: requirer.group_id });
    if (groupMembers.length > 1) {
      return res.status(400).send({
        success: false,
        msg: 'A profil törlése nem engedélyezett amíg más felhasználók is vannak a csoportban.',
      });
    }
    const deletedUser = await User.findByIdAndDelete(requirer.id);
    await Group.findByIdAndDelete(deletedUser.group_id);
    return res.status(200).send({
      success: true,
      msg: 'A profil és a csoport törölve.',
      email: deletedUser.email,
    });
  }
  // Non-admin deleting their own account
  if (!isAdmin && userId === requirer.id) {
    const deletedUser = await User.findByIdAndDelete(userId);
    return res.status(200).send({
      success: true,
      msg: 'Profil törölve.',
      email: deletedUser.email,
    });
  }
  return res.status(403).send({ success: false, msg: 'Authorization failed.' });
};

const getAdminData = async (req, res) => {
  const { group } = await auth.getUserAndGroup(auth.getToken(req.headers));
  const [groupMembers, pendingUsers] = await Promise.all([
    User.find({ group_id: group.id }),
    // N+1 fix: single query for all pending users
    User.find({ _id: { $in: group.pending_requests } }),
  ]);
  const nonAdminUsers = groupMembers
    .filter((m) => !m._id.equals(group.admin) && m.account_type === 'ACKNOWLEDGED')
    .map((m) => ({ ...m.toObject(), password: undefined }));
  return res.status(200).send({
    group_members: nonAdminUsers,
    pending_requests: pendingUsers.map((u) => u.email),
  });
};

module.exports = { acknowledge, deleteUser, getAdminData, archive };
