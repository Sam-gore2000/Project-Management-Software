const { pool } = require('../config/db');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'Admin';

    // ── Total Projects ──
    let total_projects = 0;
    if (isAdmin) {
      const [[row]] = await pool.query('SELECT COUNT(*) AS total_projects FROM projects');
      total_projects = row.total_projects;
    } else {
      const [[row]] = await pool.query(
        'SELECT COUNT(*) AS total_projects FROM project_users WHERE user_id = ?', [userId]);
      total_projects = row.total_projects;
    }

    // ── Tasks by Status ──
    let tasksByStatus = [];
    if (isAdmin) {
      const [rows] = await pool.query('SELECT status, COUNT(id) AS count FROM tasks GROUP BY status');
      tasksByStatus = rows;
    } else {
      const [rows] = await pool.query(
        `SELECT t.status, COUNT(t.id) AS count FROM tasks t
         INNER JOIN project_users pu ON t.project_id = pu.project_id
         WHERE pu.user_id = ? GROUP BY t.status`, [userId]);
      tasksByStatus = rows;
    }

    // ── My Tasks & Overdue ──
    const [[{ my_tasks }]] = await pool.query(
      "SELECT COUNT(*) AS my_tasks FROM tasks WHERE assigned_to = ? AND status != 'Done'", [userId]);
    const [[{ overdue_tasks }]] = await pool.query(
      "SELECT COUNT(*) AS overdue_tasks FROM tasks WHERE assigned_to = ? AND due_date < CURDATE() AND status != 'Done'", [userId]);

    // ── Recent Activity (all roles) ──
    const [recentActivity] = await pool.query(
      `SELECT al.*, u.name AS user_name, p.name AS project_name
       FROM activity_logs al
       JOIN users u ON al.user_id = u.id
       LEFT JOIN projects p ON al.project_id = p.id
       ORDER BY al.created_at DESC LIMIT 10`);

    // ── Projects Progress ──
    let projectsProgress = [];
    if (isAdmin) {
      const [rows] = await pool.query(
        `SELECT p.id, p.name, p.status,
           COUNT(DISTINCT t.id) AS total_tasks,
           SUM(CASE WHEN t.status='Done' THEN 1 ELSE 0 END) AS completed_tasks
         FROM projects p LEFT JOIN tasks t ON p.id = t.project_id
         GROUP BY p.id ORDER BY p.created_at DESC LIMIT 5`);
      projectsProgress = rows;
    } else {
      const [rows] = await pool.query(
        `SELECT p.id, p.name, p.status,
           COUNT(DISTINCT t.id) AS total_tasks,
           SUM(CASE WHEN t.status='Done' THEN 1 ELSE 0 END) AS completed_tasks
         FROM projects p
         INNER JOIN project_users pu ON p.id = pu.project_id AND pu.user_id = ?
         LEFT JOIN tasks t ON p.id = t.project_id
         GROUP BY p.id ORDER BY p.created_at DESC LIMIT 5`, [userId]);
      projectsProgress = rows;
    }

    // ── User Workload (ALL roles see this) ──
    // Admin: all users | Manager/Employee: users in same projects
    let userWorkload = [];
    if (isAdmin) {
      const [rows] = await pool.query(
        `SELECT u.id, u.name,
           COUNT(CASE WHEN t.status='To Do'       THEN 1 END) AS todo,
           COUNT(CASE WHEN t.status='In Progress' THEN 1 END) AS in_progress,
           COUNT(CASE WHEN t.status='In Review'   THEN 1 END) AS in_review,
           COUNT(CASE WHEN t.status='Done'        THEN 1 END) AS done
         FROM users u
         LEFT JOIN tasks t ON u.id = t.assigned_to
         GROUP BY u.id
         HAVING (todo + in_progress + in_review + done) > 0
         ORDER BY (todo + in_progress) DESC
         LIMIT 10`);
      userWorkload = rows;
    } else {
      // Show workload of teammates in same projects
      const [rows] = await pool.query(
        `SELECT u.id, u.name,
           COUNT(CASE WHEN t.status='To Do'       THEN 1 END) AS todo,
           COUNT(CASE WHEN t.status='In Progress' THEN 1 END) AS in_progress,
           COUNT(CASE WHEN t.status='In Review'   THEN 1 END) AS in_review,
           COUNT(CASE WHEN t.status='Done'        THEN 1 END) AS done
         FROM users u
         INNER JOIN project_users pu ON u.id = pu.user_id
         WHERE pu.project_id IN (
           SELECT project_id FROM project_users WHERE user_id = ?
         )
         LEFT JOIN tasks t ON u.id = t.assigned_to
         GROUP BY u.id
         HAVING (todo + in_progress + in_review + done) > 0
         ORDER BY (todo + in_progress) DESC
         LIMIT 10`, [userId]);
      userWorkload = rows;
    }

    res.json({
      success: true,
      stats: {
        total_projects,
        my_tasks,
        overdue_tasks,
        tasks_by_status:   tasksByStatus,
        recent_activity:   recentActivity,
        projects_progress: projectsProgress,
        user_workload:     userWorkload,
      }
    });
  } catch (err) { next(err); }
};

exports.getNotifications = async (req, res, next) => {
  try {
    const [notifications] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [req.user.id]);
    res.json({ success: true, notifications });
  } catch (err) { next(err); }
};

exports.markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [id, req.user.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
};

exports.markAllNotificationsRead = async (req, res, next) => {
  try {
    await pool.query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
};
