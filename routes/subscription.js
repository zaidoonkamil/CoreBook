const express = require('express');
const router = express.Router();
const Subscription = require('../models/subscription');
const Teacher = require('../models/teacher');
const Subject = require('../models/subject');
const User = require('../models/user');
const Class = require('../models/class');
const multer = require("multer");
const upload = multer();
const { sendNotificationToRoleWithoutLog, sendNotificationToUser } = require('../services/notifications');
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");


router.post("/db/repair-once", async (req, res) => {
  const t = await sequelize.transaction();
  try {
    /* =========================
       1) تنظيف الداتا اليتيمة
       ========================= */

    // Chapters بدون Lecture
    await sequelize.query(`
      DELETE c FROM chapters c
      LEFT JOIN lectures l ON l.id = c.lectureId
      WHERE l.id IS NULL
    `, { transaction: t });

    // Lectures بدون Teacher
    await sequelize.query(`
      DELETE l FROM lectures l
      LEFT JOIN teachers t2 ON t2.id = l.teacherId
      WHERE t2.id IS NULL
    `, { transaction: t });

    // Subscriptions بدون Teacher
    await sequelize.query(`
      DELETE s FROM subscriptions s
      LEFT JOIN teachers t2 ON t2.id = s.teacherId
      WHERE t2.id IS NULL
    `, { transaction: t });

    // Subscriptions بدون Student
    await sequelize.query(`
      DELETE s FROM subscriptions s
      LEFT JOIN users u ON u.id = s.studentId
      WHERE u.id IS NULL
    `, { transaction: t });

    /* =========================
       2) تعديل Foreign Keys
       ========================= */

    // Chapters -> Lectures
    await sequelize.query(`
      ALTER TABLE chapters
      DROP FOREIGN KEY chapters_ibfk_1
    `, { transaction: t });

    await sequelize.query(`
      ALTER TABLE chapters
      ADD CONSTRAINT chapters_ibfk_1
      FOREIGN KEY (lectureId) REFERENCES lectures(id)
      ON DELETE CASCADE ON UPDATE CASCADE
    `, { transaction: t });

    // Subscriptions -> Teachers
    await sequelize.query(`
      ALTER TABLE subscriptions
      DROP FOREIGN KEY subscriptions_ibfk_1
    `, { transaction: t });

    await sequelize.query(`
      ALTER TABLE subscriptions
      ADD CONSTRAINT subscriptions_ibfk_1
      FOREIGN KEY (teacherId) REFERENCES teachers(id)
      ON DELETE CASCADE ON UPDATE CASCADE
    `, { transaction: t });

    // Subscriptions -> Users (studentId)
    try {
      await sequelize.query(`
        ALTER TABLE subscriptions
        DROP FOREIGN KEY subscriptions_ibfk_2
      `, { transaction: t });

      await sequelize.query(`
        ALTER TABLE subscriptions
        ADD CONSTRAINT subscriptions_ibfk_2
        FOREIGN KEY (studentId) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE
      `, { transaction: t });
    } catch (_) {
      // إذا ما موجود القيد، نتجاهل
    }

    await t.commit();
    res.json({ message: "✅ تم إصلاح قاعدة البيانات بنجاح (نفذ مرة وحدة)" });

  } catch (err) {
    await t.rollback();
    console.error("❌ DB Repair Error:", err);
    res.status(500).json({
      error: "DB repair failed",
      details: err.message,
    });
  }
});




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
        },
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'phone'] 
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
        },
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'phone']
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