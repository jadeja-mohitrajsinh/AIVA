/*=================================================================
* Project: AIVA-WEB
* File: uploadRoutes.js
* Author: Mohitraj Jadeja
* Date Created: February 28, 2024
* Last Modified: February 28, 2024
*=================================================================
* Description:
* Routes for handling file uploads, including image and document
* uploads for tasks and workspaces.
*=================================================================
* Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
*=================================================================*/

import express from 'express';
import { gfs } from '../config/db.js';
import upload from '../utils/upload.js';
import mongoose from 'mongoose';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Upload file
router.post('/', protect, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({ fileId: req.file.id, filename: req.file.filename });
});

// Get file
router.get('/:fileId', async (req, res) => {
  try {
    const file = await gfs.files.findOne({ 
      _id: new mongoose.Types.ObjectId(req.params.fileId) 
    });
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const readStream = gfs.createReadStream(file.filename);
    readStream.pipe(res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete file
router.delete('/:fileId', protect, async (req, res) => {
  try {
    await gfs.files.deleteOne({ 
      _id: new mongoose.Types.ObjectId(req.params.fileId) 
    });
    res.json({ message: 'File deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 