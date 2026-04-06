-- ============================================================
--  ProjectFlow DB Fix — Run this in phpMyAdmin SQL tab
--  Fixes: "In Review" status not showing on Kanban board
-- ============================================================

USE projectflow;

-- Step 1: Add "In Review" to tasks status ENUM
ALTER TABLE tasks
  MODIFY COLUMN status ENUM('To Do','In Progress','In Review','Done') DEFAULT 'To Do';

-- Step 2: Verify the change
DESCRIBE tasks;

-- Step 3: Optional - add activity log entries so Recent Activity shows data
-- (Skip if you already imported dummy_data_with_performance.sql)
INSERT IGNORE INTO activity_logs (user_id, project_id, action, entity_type, details)
SELECT 
  created_by, 
  project_id, 
  'created_task', 
  'task',
  JSON_OBJECT('title', title)
FROM tasks
WHERE created_by IS NOT NULL
LIMIT 20;

SELECT 'DB fix complete!' AS result;
SELECT COUNT(*) AS activity_log_count FROM activity_logs;
SELECT COUNT(*) AS task_count FROM tasks;
