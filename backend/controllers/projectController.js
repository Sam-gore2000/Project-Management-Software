const { validationResult } = require('express-validator');
const { pool } = require('../config/db');

exports.getProjects = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'Admin';

    let query;
    let params;

    if (isAdmin) {
      query = `
        SELECT p.*, u.name AS creator_name,
          COUNT(DISTINCT pu.user_id) AS member_count,
          COUNT(DISTINCT t.id) AS total_tasks,
          SUM(CASE WHEN t.status = 'Done' THEN 1 ELSE 0 END) AS completed_tasks
        FROM projects p
        LEFT JOIN users u ON p.created_by = u.id
        LEFT JOIN project_users pu ON p.id = pu.project_id
        LEFT JOIN tasks t ON p.id = t.project_id
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `;
      params = [];
    } else {
      query = `
        SELECT p.*, u.name AS creator_name,
          COUNT(DISTINCT pu2.user_id) AS member_count,
          COUNT(DISTINCT t.id) AS total_tasks,
          SUM(CASE WHEN t.status = 'Done' THEN 1 ELSE 0 END) AS completed_tasks
        FROM projects p
        INNER JOIN project_users pu ON p.id = pu.project_id AND pu.user_id = ?
        LEFT JOIN users u ON p.created_by = u.id
        LEFT JOIN project_users pu2 ON p.id = pu2.project_id
        LEFT JOIN tasks t ON p.id = t.project_id
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `;
      params = [userId];
    }

    const [projects] = await pool.query(query, params);
    res.json({ success: true, projects });
  } catch (err) {
    next(err);
  }
};

exports.getProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT p.*, u.name AS creator_name,
        COUNT(DISTINCT t.id) AS total_tasks,
        SUM(CASE WHEN t.status = 'Done' THEN 1 ELSE 0 END) AS completed_tasks,
        SUM(CASE WHEN t.status = 'In Progress' THEN 1 ELSE 0 END) AS in_progress_tasks,
        SUM(CASE WHEN t.status = 'To Do' THEN 1 ELSE 0 END) AS todo_tasks
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      LEFT JOIN tasks t ON p.id = t.project_id
      WHERE p.id = ?
      GROUP BY p.id
    `, [id]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const [members] = await pool.query(`
      SELECT u.id, u.name, u.email, u.role, u.avatar, pu.role AS project_role, pu.joined_at
      FROM project_users pu
      JOIN users u ON pu.user_id = u.id
      WHERE pu.project_id = ?
    `, [id]);

    res.json({ success: true, project: { ...rows[0], members } });
  } catch (err) {
    next(err);
  }
};

exports.createProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, description, memberIds = [] } = req.body;
    const createdBy = req.user.id;

    const [result] = await pool.query(
      'INSERT INTO projects (name, description, created_by) VALUES (?, ?, ?)',
      [name, description, createdBy]
    );

    const projectId = result.insertId;

    // Add creator as Owner
    await pool.query(
      'INSERT INTO project_users (project_id, user_id, role) VALUES (?, ?, ?)',
      [projectId, createdBy, 'Owner']
    );

    // Add other members
    if (memberIds.length) {
      const memberValues = memberIds
        .filter(id => id !== createdBy)
        .map(id => [projectId, id, 'Member']);
      if (memberValues.length) {
        await pool.query('INSERT IGNORE INTO project_users (project_id, user_id, role) VALUES ?', [memberValues]);
      }
    }

    await logActivity(createdBy, projectId, 'created_project', 'project', projectId, { name });

    const [project] = await pool.query('SELECT * FROM projects WHERE id = ?', [projectId]);
    res.status(201).json({ success: true, message: 'Project created.', project: project[0] });
  } catch (err) {
    next(err);
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    const [existing] = await pool.query('SELECT * FROM projects WHERE id = ?', [id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    await pool.query(
      'UPDATE projects SET name = ?, description = ?, status = ? WHERE id = ?',
      [name || existing[0].name, description ?? existing[0].description, status || existing[0].status, id]
    );

    await logActivity(req.user.id, id, 'updated_project', 'project', id, { name });

    res.json({ success: true, message: 'Project updated.' });
  } catch (err) {
    next(err);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM projects WHERE id = ?', [id]);
    res.json({ success: true, message: 'Project deleted.' });
  } catch (err) {
    next(err);
  }
};

exports.addMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    await pool.query(
      'INSERT IGNORE INTO project_users (project_id, user_id, role) VALUES (?, ?, ?)',
      [id, userId, 'Member']
    );

    res.json({ success: true, message: 'Member added.' });
  } catch (err) {
    next(err);
  }
};

exports.removeMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    await pool.query('DELETE FROM project_users WHERE project_id = ? AND user_id = ?', [id, userId]);
    res.json({ success: true, message: 'Member removed.' });
  } catch (err) {
    next(err);
  }
};

async function logActivity(userId, projectId, action, entityType, entityId, details) {
  try {
    await pool.query(
      'INSERT INTO activity_logs (user_id, project_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, projectId, action, entityType, entityId, JSON.stringify(details)]
    );
  } catch (e) { /* silent */ }
}
