const express = require('express');
const router = express.Router();
const Subscription = require('../models/subscription');
const Teacher = require('../models/teacher');
const Subject = require('../models/subject');
const multer = require("multer");
const upload = multer();

// طلب اشتراك (من الطالب)
router.post('/subscription', upload.none(), async (req, res) => {
  try {
    const { studentId, teacherId } = req.body;
    const newSubscription = await Subscription.create({ studentId, teacherId });
    res.status(201).json(newSubscription);
  } catch (error) {
    res.status(500).json({ error: 'خطأ أثناء طلب الاشتراك', details: error.message });
  }
});

// تفعيل أو رفض الاشتراك (من الأدمن)
router.patch('/subscription/:id',upload.none(),async (req, res) => {
  try {
    const { status } = req.body;
    const subscription = await Subscription.findByPk(req.params.id);

    if (!subscription) return res.status(404).json({ error: 'الاشتراك غير موجود' });

    subscription.status = status;
    await subscription.save();

    res.status(200).json(subscription);
  } catch (error) {
    res.status(500).json({ error: 'خطأ أثناء تحديث حالة الاشتراك', details: error.message });
  }
});

// جلب اشتراكات طالب معين
router.get('/student/:studentId', async (req, res) => {
  try {
    const subscriptions = await Subscription.findAll({ where: { studentId: req.params.studentId } });
    res.status(200).json(subscriptions);
  } catch (error) {
    res.status(500).json({ error: 'خطأ أثناء جلب الاشتراكات', details: error.message });
  }
});

router.post('/check-subscription', upload.none(), async (req, res) => {
  try {
    const { studentId, teacherId } = req.body;

    const subscription = await Subscription.findOne({
      where: { studentId, teacherId }
    });

    if (subscription) {
      res.json({ subscribed: true });
    } else {
      res.json({ subscribed: false });
    }

  } catch (error) {
    res.status(500).json({ error: 'خطأ أثناء التحقق من الاشتراك', details: error.message });
  }
});



module.exports = router;
