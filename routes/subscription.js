const express = require('express');
const router = express.Router();
const Subscription = require('../models/subscription');
const Teacher = require('../models/teacher');
const Subject = require('../models/subject');
const Class = require('../models/class');
const multer = require("multer");
const upload = multer();
const { sendNotificationToRoleWithoutLog, sendNotificationToUser } = require('../services/notifications');

// طلب اشتراك (من الطالب)
router.post('/subscription', upload.none(), async (req, res) => {
  try {
    const { studentId, teacherId } = req.body;
    const newSubscription = await Subscription.create({ studentId, teacherId });
    const notificationMessage = `هناك طلب اشتراك جديد للدورة من الطالب رقم ${studentId}`;
    await sendNotificationToRoleWithoutLog("admin", notificationMessage, "طلب اشتراك جديد");
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

    const studentId = subscription.studentId;
    const message = `تم ${status === 'accepted' ? 'قبول' : 'تحديث'} طلب اشتراكك بنجاح`;
    await sendNotificationToUser(studentId, message, 'حالة الاشتراك');

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

// جلب جميع طلبات الاشتراك مع إمكانية فلترة بالحالة
router.get('/subscriptions', async (req, res) => {
  try {
    const { status } = req.query;

    const whereCondition = {};
    if (status) {
      whereCondition.status = status;
    }

    const subscriptions = await Subscription.findAll({
      where: whereCondition,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Teacher,
          include: [
            {
              model: Subject,
              attributes: ['id', 'name', 'classId'],
              include: [
                {
                  model: Class,
                  attributes: ['id', 'name']
                }
              ]
            }
          ]
        }
      ]
    });

    res.status(200).json(subscriptions);
  } catch (error) {
    console.error("❌ Error fetching subscriptions:", error);
    res.status(500).json({ error: 'خطأ أثناء جلب طلبات الاشتراك', details: error.message });
  }
});

router.get('/subscriptions/active', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows: subscriptions } = await Subscription.findAndCountAll({
      where: { status: 'active' },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: Teacher,
          include: [
            {
              model: Subject,
              attributes: ['id', 'name', 'classId'],
              include: [
                {
                  model: Class,
                  attributes: ['id', 'name']
                }
              ]
            }
          ]
        }
      ]
    });

    res.status(200).json({
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      subscriptions
    });

  } catch (error) {
    console.error("❌ Error fetching active subscriptions:", error);
    res.status(500).json({ error: 'خطأ أثناء جلب طلبات الاشتراك', details: error.message });
  }
});


module.exports = router;