const express = require('express');
const router = express.Router();
const Subject = require('../models/subject');
const multer = require("multer");
const upload = multer();

router.post('/subject',upload.none() , async (req, res) => {
  try {
    const { name, classId, color} = req.body;
    const newSubject = await Subject.create({ name, classId, color });
    res.status(201).json(newSubject);
  } catch (error) {
    res.status(500).json({ error: 'خطأ أثناء إضافة المادة', details: error.message });
  }
});

router.get('/subject', async (req, res) => {
  try {
    const subjects = await Subject.findAll();
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ error: 'خطأ أثناء جلب المواد', details: error.message });
  }
});

router.get('/class/:classId', async (req, res) => {
  try {
    const { classId } = req.params;
    const subjects = await Subject.findAll({ where: { classId } });
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ error: 'خطأ أثناء جلب المواد الخاصة بالصف', details: error.message });
  }
});

router.delete('/subject/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findByPk(id);
    
    if (!subject) {
      return res.status(404).json({ error: 'المادة غير موجودة' });
    }

    await subject.destroy();
    res.status(200).json({ message: 'تم حذف المادة بنجاح' });
  } catch (error) {
    res.status(500).json({ error: 'خطأ أثناء حذف المادة', details: error.message });
  }
}
);

module.exports = router;
