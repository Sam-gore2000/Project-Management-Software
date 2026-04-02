const { validationResult } = require('express-validator');
const { pool } = require('../config/db');

exports.getTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { status, priority, assignedTo, search } = req.query;
    let query = `
      SELECT t.id, t.project_id, t.title, t.description, t.assigned_to, t.created_by,
        t.status, t.priority, t.due_date, t.position, t.created_at, t.updated_at,
        u.name AS assigned_user_name, u.avatar AS assigned_user_avatar,
        c.name AS creator_name, COUNT(tc.id) AS comment_count
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN users c ON t.created_by = c.id
      LEFT JOIN task_comments tc ON t.id = tc.task_id
      WHERE t.project_id = ?`;
    const params = [projectId];
    if (status) { query += ' AND t.status = ?'; params.push(status); }
    if (priority) { query += ' AND t.priority = ?'; params.push(priority); }
    if (assignedTo) { query += ' AND t.assigned_to = ?'; params.push(assignedTo); }
    if (search) { query += ' AND (t.title LIKE ? OR t.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    query += ' GROUP BY t.id ORDER BY t.position ASC, t.created_at DESC';
    const [tasks] = await pool.query(query, params);
    res.json({ success: true, tasks });
  } catch (err) { next(err); }
};

exports.getTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT t.id, t.project_id, t.title, t.description, t.assigned_to, t.created_by,
        t.status, t.priority, t.due_date, t.position, t.created_at, t.updated_at,
        u.name AS assigned_user_name, u.avatar AS assigned_user_avatar, c.name AS creator_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN users c ON t.created_by = c.id
      WHERE t.id = ?`, [id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Task not found' });
    const [comments] = await pool.query(`
      SELECT tc.*, u.name AS user_name, u.avatar FROM task_comments tc
      JOIN users u ON tc.user_id = u.id WHERE tc.task_id = ? ORDER BY tc.created_at ASC`, [id]);
    res.json({ success: true, task: { ...rows[0], comments } });
  } catch (err) { next(err); }
};

exports.createTask = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { title, description, assignedTo, status, priority, dueDate } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ success: false, message: 'Title is required' });
    const [result] = await pool.query(
      `INSERT INTO tasks (project_id, title, description, assigned_to, created_by, status, priority, due_date)
       VALUES (?,?,?,?,?,?,?,?)`,
      [projectId, title.trim(), description || null, assignedTo || null, req.user.id,
       status || 'To Do', priority || 'Medium', dueDate || null]);
    if (assignedTo && parseInt(assignedTo) !== req.user.id) {
      await pool.query('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?,?,?,?,?)',
        [assignedTo, 'task_assigned', 'New Task Assigned', `You have been assigned: ${title}`, `/projects/${projectId}/board`]);
    }
    const [task] = await pool.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, task: task[0] });
  } catch (err) { next(err); }
};

exports.updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Task not found' });
    const t = existing[0];
    const { title, description, assignedTo, status, priority, dueDate, position } = req.body;
    await pool.query(
      `UPDATE tasks SET title=?, description=?, assigned_to=?, status=?, priority=?, due_date=?, position=? WHERE id=?`,
      [title ?? t.title, description ?? t.description,
       assignedTo !== undefined ? (assignedTo || null) : t.assigned_to,
       status ?? t.status, priority ?? t.priority,
       dueDate !== undefined ? (dueDate || null) : t.due_date,
       position !== undefined ? position : t.position, id]);
    res.json({ success: true, message: 'Task updated' });
  } catch (err) { next(err); }
};

exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, position } = req.body;
    await pool.query('UPDATE tasks SET status=?, position=? WHERE id=?', [status, position ?? 0, id]);
    res.json({ success: true });
  } catch (err) { next(err); }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) { next(err); }
};

exports.getComments = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const [comments] = await pool.query(`
      SELECT tc.*, u.name AS user_name, u.avatar FROM task_comments tc
      JOIN users u ON tc.user_id = u.id WHERE tc.task_id = ? ORDER BY tc.created_at ASC`, [taskId]);
    res.json({ success: true, comments });
  } catch (err) { next(err); }
};

exports.addComment = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { comment } = req.body;
    if (!comment?.trim()) return res.status(400).json({ success: false, message: 'Comment required' });
    const [result] = await pool.query('INSERT INTO task_comments (task_id, user_id, comment) VALUES (?,?,?)',
      [taskId, req.user.id, comment.trim()]);
    const [rows] = await pool.query(`SELECT tc.*, u.name AS user_name, u.avatar FROM task_comments tc
      JOIN users u ON tc.user_id = u.id WHERE tc.id = ?`, [result.insertId]);
    res.status(201).json({ success: true, comment: rows[0] });
  } catch (err) { next(err); }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM task_comments WHERE id = ? AND user_id = ?', [id, req.user.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
};
