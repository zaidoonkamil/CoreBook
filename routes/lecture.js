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

router.delete('/lecture/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const lecture = await Lecture.findByPk(id);

    if (!lecture) {
      return res.status(404).json({ error: 'المحاضرة غير موجودة' });
    }

    await lecture.destroy();
    res.status(200).json({ message: 'تم حذف المحاضرة بنجاح' });
  } catch (error) {
    res.status(500).json({ error: 'خطأ أثناء حذف المحاضرة', details: error.message });
  }
});


module.exports = router;
