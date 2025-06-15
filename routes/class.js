const express = require('express');
const router = express.Router();
const Class = require('../models/class');
const multer = require("multer");
const upload = multer();

// إنشاء صف جديد
router.post('/class',upload.none() , async (req, res) => {
  try {
    const { name } = req.body;
    const newClass = await Class.create({ name });
    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ error: 'خطأ أثناء إنشاء الصف', details: error.message });
  }
});

// جلب جميع الصفوف
router.get('/class', async (req, res) => {
  try {
    const classes = await Class.findAll();
    res.status(200).json(classes);
  } catch (error) {
    res.status(500).json({ error: 'خطأ أثناء جلب الصفوف', details: error.message });
  }
});

// حذف صف
router.delete('/class/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const classToDelete = await Class.findByPk(id);
    if (!classToDelete) {
      return res.status(404).json({ error: 'الصف غير موجود' });
    }
    await classToDelete.destroy();
    res.status(200).json({ message: 'تم حذف الصف بنجاح' });
  } catch (error) {
    res.status(500).json({ error: 'خطأ أثناء حذف الصف', details: error.message });
  }
});

module.exports = router;
