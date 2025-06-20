const express = require('express');
const router = express.Router();
const Lecture = require('../models/lecture');
const multer = require("multer");
const upload = multer();


// إضافة محاضرة (مادة)
router.post('/lecture', upload.none(), async (req, res) => {
  try {
    const { title, teacherId } = req.body;
    const newLecture = await Lecture.create({ title, teacherId });
    res.status(201).json(newLecture);
  } catch (error) {
    res.status(500).json({ error: 'خطأ أثناء إضافة المحاضرة', details: error.message });
  }
});

// جلب محاضرات أستاذ معين
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const lectures = await Lecture.findAll({ where: { teacherId: req.params.teacherId } });
    res.status(200).json(lectures);
  } catch (error) {
    res.status(500).json({ error: 'خطأ أثناء جلب المحاضرات', details: error.message });
  }
});

// حذف محاضرات استاذ معين
router.delete('/teacher/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const lectures = await Lecture.findAll({ where: { teacherId } });

    if (lectures.length === 0) {
      return res.status(404).json({ error: 'لا توجد محاضرات لهذا الأستاذ' });
    }

    await Lecture.destroy({ where: { teacherId } });
    res.status(200).json({ message: 'تم حذف جميع المحاضرات بنجاح' });
  } catch (error) {
    res.status(500).json({ error: 'خطأ أثناء حذف المحاضرات', details: error.message });
  }
}
);

module.exports = router;
