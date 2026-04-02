-- Run this in phpMyAdmin SQL tab to add new tables to existing projectflow database
USE projectflow;

-- Add new columns to tasks if they don't exist
ALTER TABLE tasks 
  ADD COLUMN IF NOT EXISTS sprint_id INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS labels JSON DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS time_estimate INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS time_spent INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_bug TINYINT(1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reopened_count INT DEFAULT 0;

-- Add key_code to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS key_code VARCHAR(10) DEFAULT NULL;

-- Update tasks status to include In Review
ALTER TABLE tasks MODIFY COLUMN status ENUM('To Do','In Progress','In Review','Done') DEFAULT 'To Do';

-- Create sprints table
CREATE TABLE IF NOT EXISTS sprints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  name VARCHAR(200) NOT NULL,
  goal TEXT,
  status ENUM('Planning','Active','Completed') DEFAULT 'Planning',
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Add sprint_id FK to tasks after sprints table exists
ALTER TABLE tasks ADD CONSTRAINT fk_task_sprint FOREIGN KEY (sprint_id) REFERENCES sprints(id) ON DELETE SET NULL;

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_size INT DEFAULT 0,
  uploaded_by INT NOT NULL,
  project_id INT DEFAULT NULL,
  task_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
);

-- Create performance_metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  project_id INT DEFAULT NULL,
  period_type ENUM('weekly','monthly') DEFAULT 'weekly',
  period_start DATE NOT NULL,
  tasks_assigned INT DEFAULT 0,
  tasks_completed INT DEFAULT 0,
  bugs_created INT DEFAULT 0,
  reopened_tasks INT DEFAULT 0,
  avg_time_overrun DECIMAL(5,2) DEFAULT 0,
  performance_score DECIMAL(4,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

SELECT 'Migration complete!' AS status;
