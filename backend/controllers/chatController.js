const { pool } = require('../config/db');
const path = require('path');

exports.getMessages = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { page = 1, limit = 50, since } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT m.*, u.name AS sender_name, u.avatar AS sender_avatar,
        pm.message AS parent_message, pm_u.name AS parent_sender_name
      FROM messages m
      JOIN users u ON m.user_id = u.id
      LEFT JOIN messages pm ON m.parent_message_id = pm.id
      LEFT JOIN users pm_u ON pm.user_id = pm_u.id
      WHERE m.project_id = ?
    `;
    const params = [projectId];

    if (since) {
      query += ' AND m.created_at > ?';
      params.push(since);
    }

    query += ' ORDER BY m.created_at ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [messages] = await pool.query(query, params);

    // Mark messages as seen
    await pool.query(
      `UPDATE messages SET seen_by = JSON_ARRAY_APPEND(COALESCE(seen_by, JSON_ARRAY()), '$', ?)
       WHERE project_id = ? AND user_id != ? AND (seen_by IS NULL OR NOT JSON_CONTAINS(seen_by, ?))`,
      [req.user.id, projectId, req.user.id, `${req.user.id}`]
    );

    res.json({ success: true, messages });
  } catch (err) {
    next(err);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { message, parentMessageId } = req.body;

    if (!message?.trim() && !req.file) {
      return res.status(400).json({ success: false, message: 'Message or file is required.' });
    }

    let fileUrl = null, fileName = null, fileType = null;
    if (req.file) {
      fileUrl = `/uploads/chat-files/${req.file.filename}`;
      fileName = req.file.originalname;
      fileType = req.file.mimetype;
    }

    const [result] = await pool.query(
      'INSERT INTO messages (project_id, user_id, message, file_url, file_name, file_type, parent_message_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [projectId, req.user.id, message?.trim() || null, fileUrl, fileName, fileType, parentMessageId || null]
    );

    const [rows] = await pool.query(`
      SELECT m.*, u.name AS sender_name, u.avatar AS sender_avatar,
        pm.message AS parent_message, pm_u.name AS parent_sender_name
      FROM messages m
      JOIN users u ON m.user_id = u.id
      LEFT JOIN messages pm ON m.parent_message_id = pm.id
      LEFT JOIN users pm_u ON pm.user_id = pm_u.id
      WHERE m.id = ?
    `, [result.insertId]);

    res.status(201).json({ success: true, message: rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM messages WHERE id = ?', [id]);

    if (!rows.length) return res.status(404).json({ success: false, message: 'Message not found.' });

    if (rows[0].user_id !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    // Delete file if exists
    if (rows[0].file_url) {
      const fs = require('fs');
      const filePath = path.join(__dirname, '..', rows[0].file_url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await pool.query('DELETE FROM messages WHERE id = ?', [id]);
    res.json({ success: true, message: 'Message deleted.' });
  } catch (err) {
    next(err);
  }
};

exports.getNewMessages = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { since } = req.query;

    if (!since) {
      return res.status(400).json({ success: false, message: 'since parameter required.' });
    }

    const [messages] = await pool.query(`
      SELECT m.*, u.name AS sender_name, u.avatar AS sender_avatar,
        pm.message AS parent_message, pm_u.name AS parent_sender_name
      FROM messages m
      JOIN users u ON m.user_id = u.id
      LEFT JOIN messages pm ON m.parent_message_id = pm.id
      LEFT JOIN users pm_u ON pm.user_id = pm_u.id
      WHERE m.project_id = ? AND m.created_at > ?
      ORDER BY m.created_at ASC
    `, [projectId, since]);

    res.json({ success: true, messages });
  } catch (err) {
    next(err);
  }
};
