const express = require('express');
const router = express.Router();
const Chapter = require('../models/chapter');
const multer = require("multer");
const upload = multer();

// إضافة فصل لمحاضرة
router.post('/chapter', upload.none(), async (req, res) => {
  try {
    const { videoUrl, attachment, summary, lectureId } = req.body;
    const newChapter = await Chapter.create({ title, videoUrl, attachment, summary, lectureId });
    res.status(201).json(newChapter);
  } catch (error) {
    res.status(500).json({ error: 'خطأ أثناء إضافة الفصل', details: error.message });
  }
});

// جلب فصول محاضرة معينة
router.get('/lecture/:lectureId', async (req, res) => {
  try {
    const chapters = await Chapter.findAll({ where: { lectureId: req.params.lectureId } });
    res.status(200).json(chapters);
  } catch (error) {
    res.status(500).json({ error: 'خطأ أثناء جلب الفصول', details: error.message });
  }
});

module.exports = router;