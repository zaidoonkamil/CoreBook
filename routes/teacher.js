const express = require('express');
const router = express.Router();
const Teacher = require('../models/teacher');
const Subject = require('../models/subject');
const multer = require("multer");
const upload = require("../middlewares/uploads");


// إضافة أستاذ جديد لمادة
router.post('/teacher',upload.array("images",5)  , async (req, res) => {
  try {
    const { name, subjectId, price } = req.body;
    if (!req.files || req.files.length === 0 || !price) {
        return res.status(400).json({ error: "جميع الحقول مطلوبة" });
    }
    const images = req.files.map(file => file.filename);
    const newTeacher = await Teacher.create({ name, subjectId , images, price });
    res.status(201).json(newTeacher);
  } catch (error) {
    res.status(500).json({ error: 'خطأ أثناء إضافة الأستاذ', details: error.message });
  }
});

// جلب جميع الأساتذة
router.get('/teacher', async (req, res) => {
  try {
    const teachers = await Teacher.findAll({
      include: [{
        model: Subject,
        attributes: ['name']   // ✅ فقط الاسم
      }]
    });

    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ error: 'خطأ أثناء جلب المدرسين', details: error.message });
  }
});

// جلب جميع أساتذة صف معين
router.get('/class/:classId/teachers', async (req, res) => {
  try {
    const { classId } = req.params;

    const teachers = await Teacher.findAll({
      include: {
        model: Subject,
        where: { classId },
        attributes: ['id', 'name']
      }
    });

    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ error: 'خطأ أثناء جلب أساتذة الصف', details: error.message });
  }
});

// جلب أساتذة مادة معينة
router.get('/subject/:subjectId', async (req, res) => {
  try {
    const { subjectId } = req.params;
    const teachers = await Teacher.findAll({ where: { subjectId } });
    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ error: 'خطأ أثناء جلب أساتذة المادة', details: error.message });
  }
});

module.exports = router;
