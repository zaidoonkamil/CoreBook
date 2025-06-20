const express = require('express');
const router = express.Router();
const Chapter = require('../models/chapter');
const multer = require("multer");
const upload = multer();

// إضافة محاضرات للفصل
router.post('/chapter', upload.none(), async (req, res) => {
  try {
    const { videoUrl, attachment, summary, lectureId } = req.body;
    const newChapter = await Chapter.create({ videoUrl, attachment, summary, lectureId });
    res.status(201).json(newChapter);
  } catch (error) {
    res.status(500).json({ error: 'خطأ أثناء إضافة الفصل', details: error.message });
  }
});

router.get('/lecture/:lectureId', async (req, res) => {
  try {
    const chapters = await Chapter.findAll({ where: { lectureId: req.params.lectureId } });
    res.status(200).json(chapters);
  } catch (error) {
    res.status(500).json({ error: 'خطأ أثناء جلب الفصول', details: error.message });
  }
});

// حذف فصول محاضرة معينة
router.delete('/lecture/:lectureId', async (req, res) => {  
  try {
    const { lectureId } = req.params;
    const chapters = await Chapter.findAll({ where: { lectureId } });

    if (chapters.length === 0) {
      return res.status(404).json({ error: 'لا توجد فصول لهذا الفصل' });
    }

    await Chapter.destroy({ where: { lectureId } });
    res.status(200).json({ message: 'تم حذف جميع الفصول بنجاح' });
  } catch (error) {
    res.status(500).json({ error: 'خطأ أثناء حذف الفصول', details: error.message });
  }
}
);

module.exports = router;