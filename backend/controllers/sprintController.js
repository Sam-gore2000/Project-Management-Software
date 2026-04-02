const { pool } = require('../config/db');

exports.getSprints = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const [sprints] = await pool.query(`
      SELECT s.*, COUNT(t.id) AS task_count,
        SUM(CASE WHEN t.status='Done' THEN 1 ELSE 0 END) AS completed_tasks
      FROM sprints s LEFT JOIN tasks t ON s.id = t.sprint_id
      WHERE s.project_id = ? GROUP BY s.id ORDER BY s.created_at DESC`, [projectId]);
    res.json({ success: true, sprints });
  } catch (err) { next(err); }
};

exports.createSprint = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { name, goal, start_date, end_date } = req.body;
    const [result] = await pool.query(
      'INSERT INTO sprints (project_id, name, goal, start_date, end_date) VALUES (?,?,?,?,?)',
      [projectId, name, goal, start_date || null, end_date || null]
    );
    const [rows] = await pool.query('SELECT * FROM sprints WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, sprint: rows[0] });
  } catch (err) { next(err); }
};

exports.updateSprint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, goal, status, start_date, end_date } = req.body;
    await pool.query('UPDATE sprints SET name=?, goal=?, status=?, start_date=?, end_date=? WHERE id=?',
      [name, goal, status, start_date, end_date, id]);
    res.json({ success: true, message: 'Sprint updated' });
  } catch (err) { next(err); }
};

exports.getBacklog = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const [tasks] = await pool.query(`
      SELECT t.*, u.name AS assigned_user_name
      FROM tasks t LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.project_id = ? AND t.sprint_id IS NULL
      ORDER BY t.created_at DESC`, [projectId]);
    res.json({ success: true, tasks });
  } catch (err) { next(err); }
};

exports.assignToSprint = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { sprint_id } = req.body;
    await pool.query('UPDATE tasks SET sprint_id = ? WHERE id = ?', [sprint_id || null, taskId]);
    res.json({ success: true, message: 'Task sprint updated' });
  } catch (err) { next(err); }
};
