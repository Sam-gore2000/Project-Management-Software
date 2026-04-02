const { pool } = require('../config/db');
const path = require('path');
const fs = require('fs');

exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const { project_id, task_id } = req.body;
    const fileUrl = `/uploads/documents/${req.file.filename}`;
    const [result] = await pool.query(
      'INSERT INTO documents (file_name, original_name, file_type, file_url, file_size, uploaded_by, project_id, task_id) VALUES (?,?,?,?,?,?,?,?)',
      [req.file.filename, req.file.originalname, req.file.mimetype, fileUrl, req.file.size, req.user.id, project_id || null, task_id || null]
    );
    const [rows] = await pool.query(`
      SELECT d.*, u.name AS uploader_name, p.name AS project_name
      FROM documents d JOIN users u ON d.uploaded_by = u.id
      LEFT JOIN projects p ON d.project_id = p.id WHERE d.id = ?`, [result.insertId]);
    res.status(201).json({ success: true, document: rows[0] });
  } catch (err) { next(err); }
};

exports.getDocuments = async (req, res, next) => {
  try {
    const { search, type, project_id, task_id } = req.query;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'Admin';

    let query = `SELECT d.*, u.name AS uploader_name, p.name AS project_name
      FROM documents d JOIN users u ON d.uploaded_by = u.id
      LEFT JOIN projects p ON d.project_id = p.id WHERE 1=1`;
    const params = [];

    if (!isAdmin) {
      query += ` AND (d.uploaded_by = ? OR d.project_id IN (SELECT project_id FROM project_users WHERE user_id = ?))`;
      params.push(userId, userId);
    }
    if (search) { query += ' AND (d.original_name LIKE ? OR u.name LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    if (type) { query += ' AND d.file_type LIKE ?'; params.push(`%${type}%`); }
    if (project_id) { query += ' AND d.project_id = ?'; params.push(project_id); }
    if (task_id) { query += ' AND d.task_id = ?'; params.push(task_id); }
    query += ' ORDER BY d.created_at DESC';

    const [docs] = await pool.query(query, params);
    res.json({ success: true, documents: docs });
  } catch (err) { next(err); }
};

exports.deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM documents WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Document not found' });
    if (rows[0].uploaded_by !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const filePath = path.join(__dirname, '..', rows[0].file_url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await pool.query('DELETE FROM documents WHERE id = ?', [id]);
    res.json({ success: true, message: 'Document deleted' });
  } catch (err) { next(err); }
};
