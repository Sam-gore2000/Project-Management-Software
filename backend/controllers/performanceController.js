const { pool } = require('../config/db');

// Helper - remove table alias bug, and don't restrict by date so data always shows
const getDateFilter = (period) => {
  const days = period === 'weekly' ? 7 : 30;
  // No table alias - just plain column name
  return `AND created_at >= DATE_SUB(NOW(), INTERVAL ${days} DAY)`;
};

exports.getUserPerformance = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId || req.user.id);
    const { period = 'weekly' } = req.query;

    // Get user info
    const [[userRow]] = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = ?', [userId]
    );
    if (!userRow) return res.status(404).json({ success: false, message: 'User not found' });

    // Count ALL tasks assigned to user (no date filter - show all time data)
    const [[aRow]] = await pool.query(
      "SELECT COUNT(*) AS cnt FROM tasks WHERE assigned_to = ?", [userId]);
    const [[cRow]] = await pool.query(
      "SELECT COUNT(*) AS cnt FROM tasks WHERE assigned_to = ? AND status = 'Done'", [userId]);
    const [[ipRow]] = await pool.query(
      "SELECT COUNT(*) AS cnt FROM tasks WHERE assigned_to = ? AND status = 'In Progress'", [userId]);
    const [[irRow]] = await pool.query(
      "SELECT COUNT(*) AS cnt FROM tasks WHERE assigned_to = ? AND status = 'In Review'", [userId]);
    const [[tdRow]] = await pool.query(
      "SELECT COUNT(*) AS cnt FROM tasks WHERE assigned_to = ? AND status = 'To Do'", [userId]);
    const [[odRow]] = await pool.query(
      "SELECT COUNT(*) AS cnt FROM tasks WHERE assigned_to = ? AND due_date < CURDATE() AND status != 'Done'", [userId]);

    const tasksAssigned   = parseInt(aRow.cnt)  || 0;
    const tasksCompleted  = parseInt(cRow.cnt)  || 0;
    const tasksInProgress = parseInt(ipRow.cnt) || 0;
    const tasksInReview   = parseInt(irRow.cnt) || 0;
    const tasksToDo       = parseInt(tdRow.cnt) || 0;
    const overdueCount    = parseInt(odRow.cnt) || 0;
    const completionRate  = tasksAssigned > 0
      ? Math.round((tasksCompleted / tasksAssigned) * 100) : 0;

    // Score
    let score = 10;
    score -= completionRate < 50 ? 3 : completionRate < 70 ? 2 : completionRate < 85 ? 1 : 0;
    score -= Math.min(overdueCount * 0.5, 2);
    score  = Math.max(1, Math.min(10, parseFloat(score.toFixed(1))));

    // Daily trend — last 7 days completions
    const [trend] = await pool.query(`
      SELECT DATE(updated_at) AS day, COUNT(*) AS completed
      FROM tasks
      WHERE assigned_to = ? AND status = 'Done'
        AND updated_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(updated_at)
      ORDER BY day ASC`, [userId]);

    // Weekly breakdown — last 30 days
    const [weeklyBreakdown] = await pool.query(`
      SELECT YEARWEEK(updated_at, 1) AS wk, COUNT(*) AS completed
      FROM tasks
      WHERE assigned_to = ? AND status = 'Done'
        AND updated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY YEARWEEK(updated_at, 1)
      ORDER BY wk ASC`, [userId]);

    // Monthly breakdown label
    const weeklyLabeled = weeklyBreakdown.map((w, i) => ({
      week: `Week ${i + 1}`,
      completed: parseInt(w.completed) || 0
    }));

    res.json({
      success: true,
      performance: {
        user: userRow,
        period,
        tasks_assigned:   tasksAssigned,
        tasks_completed:  tasksCompleted,
        tasks_in_progress: tasksInProgress,
        tasks_in_review:  tasksInReview,
        tasks_to_do:      tasksToDo,
        overdue_tasks:    overdueCount,
        completion_rate:  completionRate,
        performance_score: score,
        trend,
        weekly_breakdown: weeklyLabeled,
        task_distribution: [
          { name: 'To Do',       value: tasksToDo       },
          { name: 'In Progress', value: tasksInProgress  },
          { name: 'In Review',   value: tasksInReview    },
          { name: 'Done',        value: tasksCompleted   },
        ]
      }
    });
  } catch (err) { next(err); }
};

exports.getTeamPerformance = async (req, res, next) => {
  try {
    const { period = 'weekly' } = req.query;

    // Get all users
    const [users] = await pool.query(
      'SELECT id, name, role FROM users ORDER BY name'
    );

    const teamData = [];
    for (const u of users) {
      const [[a]]  = await pool.query("SELECT COUNT(*) AS cnt FROM tasks WHERE assigned_to = ?", [u.id]);
      const [[c]]  = await pool.query("SELECT COUNT(*) AS cnt FROM tasks WHERE assigned_to = ? AND status='Done'", [u.id]);
      const [[od]] = await pool.query("SELECT COUNT(*) AS cnt FROM tasks WHERE assigned_to = ? AND due_date < CURDATE() AND status!='Done'", [u.id]);

      const assigned  = parseInt(a.cnt)  || 0;
      const completed = parseInt(c.cnt)  || 0;
      const rate      = assigned > 0 ? Math.round((completed / assigned) * 100) : 0;
      const overdue   = parseInt(od.cnt) || 0;

      let score = 10;
      score -= rate < 50 ? 3 : rate < 70 ? 2 : rate < 85 ? 1 : 0;
      score -= Math.min(overdue * 0.5, 2);
      score  = Math.max(1, Math.min(10, parseFloat(score.toFixed(1))));

      teamData.push({
        ...u,
        tasks_assigned:  assigned,
        tasks_completed: completed,
        completion_rate: rate,
        overdue,
        score
      });
    }

    // Sort by score descending
    teamData.sort((a, b) => b.score - a.score);

    res.json({ success: true, team: teamData });
  } catch (err) { next(err); }
};

exports.getAICoaching = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get all tasks for this user (all time)
    const [[a]]  = await pool.query("SELECT COUNT(*) AS cnt FROM tasks WHERE assigned_to = ?", [userId]);
    const [[c]]  = await pool.query("SELECT COUNT(*) AS cnt FROM tasks WHERE assigned_to = ? AND status='Done'", [userId]);
    const [[od]] = await pool.query("SELECT COUNT(*) AS cnt FROM tasks WHERE assigned_to = ? AND due_date < CURDATE() AND status!='Done'", [userId]);
    const [[ip]] = await pool.query("SELECT COUNT(*) AS cnt FROM tasks WHERE assigned_to = ? AND status='In Progress'", [userId]);
    const [[ir]] = await pool.query("SELECT COUNT(*) AS cnt FROM tasks WHERE assigned_to = ? AND status='In Review'", [userId]);

    const tasksAssigned   = parseInt(a.cnt)  || 0;
    const tasksCompleted  = parseInt(c.cnt)  || 0;
    const overdueCount    = parseInt(od.cnt) || 0;
    const inProgressCount = parseInt(ip.cnt) || 0;
    const inReviewCount   = parseInt(ir.cnt) || 0;
    const completionRate  = tasksAssigned > 0
      ? Math.round((tasksCompleted / tasksAssigned) * 100) : 0;

    let score = 10;
    score -= completionRate < 50 ? 3 : completionRate < 70 ? 2 : completionRate < 85 ? 1 : 0;
    score -= Math.min(overdueCount * 0.5, 2);
    score  = Math.max(1, Math.min(10, parseFloat(score.toFixed(1))));

    const issues      = [];
    const suggestions = [];
    const roadmap     = [];

    if (tasksAssigned === 0) {
      issues.push({ type: 'info', text: 'No tasks assigned to you yet' });
      suggestions.push('Ask your manager to assign tasks so your performance can be tracked');
      suggestions.push('Check the project board and volunteer for unassigned tasks');
      roadmap.push({ week: 1, action: 'Get at least 3 tasks assigned this week to establish a baseline' });
    } else {
      if (completionRate >= 85 && overdueCount === 0) {
        issues.push({ type: 'success', text: `Excellent! Completion rate is ${completionRate}% with no overdue tasks` });
        suggestions.push('Mentor junior team members to multiply your impact');
        suggestions.push('Take on higher-priority or more complex tasks to grow further');
        roadmap.push({ week: 1, action: 'Identify a teammate who needs help and offer to pair with them' });
        roadmap.push({ week: 2, action: 'Document your workflow so the team can learn from your process' });
      } else {
        if (completionRate < 70) {
          issues.push({ type: 'warning', text: `Completion rate is ${completionRate}% — tasks are not finishing fast enough` });
          suggestions.push('Break large tasks into smaller steps (each under 4 hours)');
          suggestions.push('Start your day by completing 1 task fully before moving to the next');
          roadmap.push({ week: 1, action: 'Pick your top 3 tasks every morning and finish them before starting new ones' });
          roadmap.push({ week: 2, action: 'Review why tasks stall — unclear requirements or technical blockers?' });
        }
        if (overdueCount > 0) {
          issues.push({ type: 'error', text: `${overdueCount} task${overdueCount > 1 ? 's are' : ' is'} overdue — deadlines are being missed` });
          suggestions.push('Deal with overdue tasks first before picking up anything new');
          suggestions.push('Set personal reminders 2 days before every due date');
          roadmap.push({ week: 1, action: `Clear all ${overdueCount} overdue task${overdueCount > 1 ? 's' : ''} this week as the highest priority` });
        }
        if (inProgressCount > 4) {
          issues.push({ type: 'warning', text: `${inProgressCount} tasks in progress simultaneously — too much context switching` });
          suggestions.push('Keep max 2-3 tasks In Progress at any time');
          suggestions.push('Finish a task before starting a new one — avoid half-done work');
        }
        if (inReviewCount > 3) {
          issues.push({ type: 'info', text: `${inReviewCount} tasks waiting in review — follow up with reviewers` });
          suggestions.push('Ping reviewers daily for tasks stuck in review for more than 2 days');
        }
      }
    }

    const summary =
      score >= 9 ? `Outstanding performance at ${score}/10! You are in the top tier of the team.`
      : score >= 8 ? `Great work at ${score}/10. You are performing above expectations.`
      : score >= 7 ? `Good performance at ${score}/10. A few tweaks will push you to excellent.`
      : score >= 6 ? `Decent at ${score}/10. Focused effort on the suggestions below will make a real difference.`
      : tasksAssigned === 0 ? `No data yet. Get tasks assigned to start tracking your performance.`
      : `Your score is ${score}/10. Follow the 2-week roadmap below — consistent effort brings visible results.`;

    res.json({
      success: true,
      coaching: {
        performance_score: score,
        completion_rate:   completionRate,
        tasks_assigned:    tasksAssigned,
        tasks_completed:   tasksCompleted,
        overdue_tasks:     overdueCount,
        issues,
        suggestions,
        roadmap,
        summary
      }
    });
  } catch (err) { next(err); }
};
