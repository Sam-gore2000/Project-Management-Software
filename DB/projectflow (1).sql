-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 02, 2026 at 07:25 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `projectflow`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `file_type` varchar(100) NOT NULL,
  `file_url` varchar(500) NOT NULL,
  `file_size` int(11) DEFAULT 0,
  `uploaded_by` int(11) NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `task_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `documents`
--

INSERT INTO `documents` (`id`, `file_name`, `original_name`, `file_type`, `file_url`, `file_size`, `uploaded_by`, `project_id`, `task_id`, `created_at`) VALUES
(1, '1775028562786-692319928.xlsx', 'MSFT BizApps Upload File.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '/uploads/documents/1775028562786-692319928.xlsx', 25956, 1, 6, NULL, '2026-04-01 07:29:22');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `message` text DEFAULT NULL,
  `file_url` varchar(500) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `parent_message_id` int(11) DEFAULT NULL,
  `seen_by` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`seen_by`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(200) NOT NULL,
  `body` text DEFAULT NULL,
  `link` varchar(300) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('Active','Completed','On Hold','Cancelled') DEFAULT 'Active',
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `name`, `description`, `status`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'Website Redesign', 'Complete overhaul of the company website including new UI/UX design, improved performance, and mobile responsiveness. Target launch Q2 2025.', 'Active', 2, '2024-01-10 03:30:00', '2026-03-27 03:51:44'),
(2, 'Mobile App v2.0', 'Build the second version of our mobile application with new features: push notifications, offline mode, dark theme, and improved onboarding flow.', 'Active', 1, '2024-01-15 04:30:00', '2026-03-27 03:51:44'),
(3, 'API Integration Hub', 'Centralized integration layer connecting all third-party services (Stripe, Twilio, SendGrid, AWS). Includes monitoring dashboard and retry logic.', 'Active', 2, '2024-02-01 03:30:00', '2026-03-27 03:51:45'),
(4, 'Internal HR Portal', 'Employee self-service portal for leave requests, payroll slips, company announcements, and performance reviews.', 'Completed', 6, '2023-11-01 02:30:00', '2026-03-27 03:51:44'),
(5, 'HRM Software', 'Create Human resource Management Tool ', 'Active', 1, '2026-03-27 09:28:26', '2026-03-27 09:28:26'),
(6, 'Foodrush Ecommerce', 'create e-commerce website like flipkart ', 'Active', 1, '2026-04-01 04:29:24', '2026-04-01 04:29:24');

-- --------------------------------------------------------

--
-- Table structure for table `project_users`
--

CREATE TABLE `project_users` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role` enum('Owner','Member') DEFAULT 'Member',
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `project_users`
--

INSERT INTO `project_users` (`id`, `project_id`, `user_id`, `role`, `joined_at`) VALUES
(1, 1, 2, 'Owner', '2024-01-10 03:30:00'),
(2, 1, 1, 'Member', '2024-01-10 03:35:00'),
(3, 1, 3, 'Member', '2024-01-10 03:40:00'),
(4, 1, 4, 'Member', '2024-01-10 03:40:00'),
(5, 1, 5, 'Member', '2024-01-11 04:30:00'),
(6, 2, 1, 'Owner', '2024-01-15 04:30:00'),
(7, 2, 2, 'Member', '2024-01-15 04:35:00'),
(8, 2, 3, 'Member', '2024-01-15 04:40:00'),
(9, 2, 5, 'Member', '2024-01-16 03:30:00'),
(10, 3, 2, 'Owner', '2024-02-01 03:30:00'),
(11, 3, 3, 'Member', '2024-02-01 03:40:00'),
(12, 3, 6, 'Member', '2024-02-02 04:30:00'),
(13, 4, 6, 'Owner', '2023-11-01 02:30:00'),
(14, 4, 1, 'Member', '2023-11-01 02:35:00'),
(15, 4, 4, 'Member', '2023-11-01 02:40:00'),
(16, 5, 1, 'Owner', '2026-03-27 09:28:26'),
(17, 5, 3, 'Member', '2026-03-27 09:28:26'),
(18, 5, 4, 'Member', '2026-03-27 09:28:26'),
(20, 5, 5, 'Member', '2026-03-27 11:32:41'),
(21, 4, 5, 'Member', '2026-03-31 09:23:15'),
(22, 6, 1, 'Owner', '2026-04-01 04:29:24'),
(23, 6, 8, 'Member', '2026-04-01 04:29:25'),
(24, 6, 5, 'Member', '2026-04-01 04:29:25'),
(25, 6, 2, 'Member', '2026-04-01 04:29:25');

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `title` varchar(300) NOT NULL,
  `description` text DEFAULT NULL,
  `assigned_to` int(11) DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `status` enum('To Do','In Progress','Done') DEFAULT 'To Do',
  `priority` enum('Low','Medium','High') DEFAULT 'Medium',
  `due_date` date DEFAULT NULL,
  `position` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_bug` tinyint(1) DEFAULT 0,
  `reopened_count` int(11) DEFAULT 0,
  `time_estimate` int(11) DEFAULT NULL,
  `time_spent` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `project_id`, `title`, `description`, `assigned_to`, `created_by`, `status`, `priority`, `due_date`, `position`, `created_at`, `updated_at`, `is_bug`, `reopened_count`, `time_estimate`, `time_spent`) VALUES
(1, 1, 'Conduct UX Research & User Interviews', 'Interview 10 existing customers to understand pain points with the current website. Document findings in Notion.', 4, 2, 'Done', 'High', '2024-02-15', 0, '2024-01-12 04:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0),
(2, 1, 'Create Low-fidelity Wireframes', 'Design wireframes for Home, About, Services, Contact, and Blog pages using Figma.', 4, 2, 'Done', 'High', '2024-02-28', 1, '2024-01-15 05:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0),
(3, 1, 'Design High-fidelity Mockups', 'Convert wireframes into full-colour Figma designs. Follow the new brand guidelines document.', 4, 2, 'In Progress', 'High', '2024-03-20', 2, '2024-02-01 03:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0),
(4, 1, 'Set Up React Project & Component Library', 'Bootstrap the React 18 project with Vite, configure ESLint/Prettier, set up Storybook for the component library.', 3, 2, 'In Progress', 'High', '2024-03-15', 0, '2024-02-05 04:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0),
(5, 1, 'Implement Homepage — Hero & Navigation', 'Build the responsive hero section and sticky navigation. Must pass Lighthouse accessibility score ≥ 90.', 3, 2, 'To Do', 'Medium', '2024-04-05', 1, '2024-02-10 05:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0),
(6, 1, 'Implement Services & Pricing Pages', 'Build the Services listing page with filter tabs and the Pricing page with toggle (monthly/annual).', 3, 2, 'To Do', 'Medium', '2024-04-15', 2, '2024-02-10 06:00:00', '2026-03-27 03:51:45', 0, 0, NULL, 0),
(7, 1, 'Write SEO-optimised Content', 'Rewrite all page copy targeting the new keyword clusters. Min 1500 words for blog posts.', NULL, 2, 'To Do', 'Low', '2024-04-20', 3, '2024-02-12 03:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0),
(8, 1, 'Cross-browser & Mobile QA Testing', 'Test on Chrome, Firefox, Safari, Edge. Mobile breakpoints: 375px, 768px, 1024px. Log bugs in GitHub Issues.', 5, 2, 'Done', 'High', '2024-04-30', 0, '2024-02-12 04:30:00', '2026-03-27 11:29:23', 0, 0, NULL, 0),
(9, 1, 'Performance Optimisation', 'Achieve LCP < 2.5s, CLS < 0.1. Implement image lazy loading, code splitting, CDN for static assets.', 3, 2, 'To Do', 'Medium', '2024-05-10', 1, '2024-02-15 03:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0),
(10, 1, 'Production Deployment & Go-Live', 'Deploy to AWS Amplify. Configure custom domain, SSL certificate, and set up CloudFront distribution.', 3, 2, 'To Do', 'High', '2024-05-31', 2, '2024-02-15 04:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0),
(11, 2, 'Define App Architecture & Tech Stack', 'Document the architecture: React Native with Expo, state management (Zustand), navigation (React Navigation v6).', 3, 1, 'Done', 'High', '2024-02-10', 0, '2024-01-16 03:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0),
(12, 2, 'Design Onboarding Flow', '5-screen onboarding with animations. Include skip option. Connect to analytics to track drop-off.', 4, 1, 'Done', 'Medium', '2024-02-20', 1, '2024-01-16 04:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0),
(13, 2, 'Implement Push Notifications (Firebase)', 'Set up Firebase Cloud Messaging for iOS and Android. Handle foreground/background/terminated states.', 3, 1, 'In Progress', 'High', '2024-03-25', 0, '2024-02-01 03:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0),
(14, 2, 'Build Offline Mode with SQLite', 'Use expo-sqlite to cache critical data locally. Implement sync-on-reconnect with conflict resolution.', 3, 1, 'In Progress', 'High', '2024-04-01', 1, '2024-02-05 04:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0),
(15, 2, 'Implement Dark Theme', 'Add dark/light theme toggle using React Navigation theming. Persist preference in AsyncStorage.', 4, 1, 'To Do', 'Medium', '2024-04-10', 0, '2024-02-10 03:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0),
(16, 2, 'App Store & Play Store Submission', 'Prepare screenshots (all sizes), write store descriptions, handle review feedback. Target both stores simultaneously.', NULL, 1, 'To Do', 'High', '2024-05-15', 1, '2024-02-10 04:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0),
(17, 2, 'QA & Device Testing', 'Test on iPhone 12/14/15, Samsung Galaxy S22/S24, Pixel 7. Use BrowserStack for additional device coverage.', 5, 1, 'To Do', 'High', '2024-05-01', 0, '2024-02-15 04:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0),
(18, 3, 'Design Integration Architecture', 'Create system design document: message queue (RabbitMQ), retry policy, dead letter queue, monitoring approach.', 3, 2, 'Done', 'High', '2024-02-15', 0, '2024-02-02 03:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0),
(19, 3, 'Stripe Payment Integration', 'Implement payment intents, webhooks for subscription events, and refund handling. Include test coverage.', 3, 2, 'In Progress', 'High', '2024-03-10', 0, '2024-02-10 03:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0),
(20, 3, 'Twilio SMS & WhatsApp Integration', 'Send OTPs, order updates, and marketing messages via Twilio. Build template management UI.', 3, 2, 'To Do', 'Medium', '2024-03-25', 1, '2024-02-10 04:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0),
(21, 3, 'SendGrid Email Service', 'Transactional emails: welcome, password reset, invoices. Build drag-drop email template editor.', 2, 2, 'To Do', 'Medium', '2024-04-04', 2, '2024-02-15 03:30:00', '2026-04-02 04:23:17', 0, 0, NULL, 0),
(22, 3, 'Integration Monitoring Dashboard', 'Real-time dashboard showing API call volumes, error rates, latency percentiles, and integration health scores.', 3, 2, 'To Do', 'Low', '2024-04-20', 3, '2024-02-15 04:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0),
(23, 4, 'Requirements Gathering', 'Workshops with HR team to document all required features and workflows.', 6, 6, 'Done', 'High', '2023-11-15', 0, '2023-11-02 03:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0),
(24, 4, 'Database Schema Design', 'Design tables for employees, leave requests, payroll, and announcements.', 1, 6, 'Done', 'High', '2023-11-30', 1, '2023-11-05 04:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0),
(25, 4, 'Build Leave Request Module', 'Employees submit requests, managers approve/reject with email notifications.', 4, 6, 'Done', 'High', '2023-12-20', 2, '2023-11-10 03:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0),
(26, 4, 'Build Payroll Slip Viewer', 'Secure PDF viewer for monthly payroll slips. Download option with audit trail.', 1, 6, 'Done', 'Medium', '2024-01-05', 3, '2023-11-15 04:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0),
(27, 4, 'User Acceptance Testing', 'HR team tests all modules. Gather feedback, fix bugs, re-test.', 5, 6, 'Done', 'High', '2024-01-20', 0, '2023-12-01 03:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0),
(28, 4, 'Production Launch', 'Deploy to company servers, migrate existing HR data, train HR team.', 1, 6, 'Done', 'High', '2024-01-31', 1, '2023-12-15 04:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0),
(29, 5, 'Create Dashboard', 'hey sam create Dashboard', 3, 1, 'Done', 'Low', '2026-03-27', 0, '2026-03-27 10:26:17', '2026-04-01 04:34:49', 0, 0, NULL, 0),
(30, 3, 'Home page', 'Create home page', 2, 2, 'To Do', 'Medium', '2026-04-02', 0, '2026-03-27 12:21:42', '2026-03-27 12:21:42', 0, 0, NULL, 0),
(31, 4, 'Create Chatbox', 'Create chatbox like whatsapp', 4, 1, 'To Do', 'Medium', '2026-04-04', 0, '2026-03-30 12:25:57', '2026-03-30 12:25:57', 0, 0, NULL, 0),
(32, 6, 'Dashboard', 'Hey sam create dahboard for ecommerce', 8, 1, 'To Do', 'Low', '2026-04-02', 0, '2026-04-01 04:30:19', '2026-04-01 04:30:19', 0, 0, NULL, 0),
(33, 5, 'Create images', 'Hey start work on images ', 4, 4, 'In Progress', 'Low', '2026-04-16', 0, '2026-04-01 04:34:41', '2026-04-01 04:34:41', 0, 0, NULL, 0),
(34, 5, 'create banner image', 'create banner image', 4, 4, 'Done', 'High', '2026-03-30', 0, '2026-04-01 07:33:43', '2026-04-01 07:35:18', 0, 0, NULL, 0),
(35, 5, 'Create Logos', 'create logo for HRM', 4, 4, 'In Progress', 'High', '2026-04-02', 0, '2026-04-01 07:34:10', '2026-04-01 07:34:10', 0, 0, NULL, 0),
(36, 5, 'create ui design for dashboard', 'create ui design for dashboard', 4, 4, 'To Do', 'High', '2026-04-03', 0, '2026-04-01 07:34:45', '2026-04-01 07:34:45', 0, 0, NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `task_comments`
--

CREATE TABLE `task_comments` (
  `id` int(11) NOT NULL,
  `task_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `comment` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('Admin','Manager','Employee') DEFAULT 'Employee',
  `avatar` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `avatar`, `created_at`, `updated_at`) VALUES
(1, 'Alex Admin', 'admin@projectflow.com', '$2b$10$K7P4Zz5zTSGyNeWL45crXekujQ/6L2mkDZh/TbOAvhAucEbtk5VmK', 'Admin', NULL, '2024-01-01 02:30:00', '2026-03-27 09:25:05'),
(2, 'Sarah Manager', 'sarah.manager@projectflow.com', '$2b$10$K7P4Zz5zTSGyNeWL45crXekujQ/6L2mkDZh/TbOAvhAucEbtk5VmK', 'Manager', NULL, '2024-01-02 03:30:00', '2026-03-27 09:25:05'),
(3, 'John Developer', 'john.dev@projectflow.com', '$2b$10$K7P4Zz5zTSGyNeWL45crXekujQ/6L2mkDZh/TbOAvhAucEbtk5VmK', 'Employee', NULL, '2024-01-03 04:30:00', '2026-03-27 09:25:05'),
(4, 'Emily Designer', 'emily.design@projectflow.com', '$2b$10$MnxPyTx/AT2zdSxAJdXveeZwYUL7LO2xXBkhdGd.D6sXVsG2DbpJ6', 'Employee', NULL, '2024-01-04 05:00:00', '2026-04-01 04:35:44'),
(5, 'Mike QA', 'mike.qa@projectflow.com', '$2b$10$K7P4Zz5zTSGyNeWL45crXekujQ/6L2mkDZh/TbOAvhAucEbtk5VmK', 'Employee', NULL, '2024-01-05 05:30:00', '2026-03-27 09:25:05'),
(6, 'Lisa Manager', 'lisa.manager@projectflow.com', '$2b$10$K7P4Zz5zTSGyNeWL45crXekujQ/6L2mkDZh/TbOAvhAucEbtk5VmK', 'Manager', NULL, '2024-01-06 06:00:00', '2026-03-27 09:25:05'),
(7, 'Admin User', 'admin@test.com', '$2b$10$K7P4Zz5zTSGyNeWL45crXekujQ/6L2mkDZh/TbOAvhAucEbtk5VmK', 'Admin', 'NULL', '2026-03-27 06:15:49', '2026-03-27 09:25:05'),
(8, 'Sam Gore', 'sam.gore@projectflow.com', '$2b$10$4h50HGZRNOIgdONvHnGvxO0r1e0N4rKZrfKF3QESV9JtXaysWKvG.', 'Employee', NULL, '2026-03-31 09:14:41', '2026-03-31 09:14:41');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `project_id` (`project_id`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `uploaded_by` (`uploaded_by`),
  ADD KEY `project_id` (`project_id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_id` (`project_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `parent_message_id` (`parent_message_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `project_users`
--
ALTER TABLE `project_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_project_user` (`project_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_id` (`project_id`),
  ADD KEY `assigned_to` (`assigned_to`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `task_comments`
--
ALTER TABLE `task_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `task_id` (`task_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `project_users`
--
ALTER TABLE `project_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `task_comments`
--
ALTER TABLE `task_comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `activity_logs_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `documents_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_3` FOREIGN KEY (`parent_message_id`) REFERENCES `messages` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `project_users`
--
ALTER TABLE `project_users`
  ADD CONSTRAINT `project_users_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `project_users_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tasks_ibfk_2` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `tasks_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `task_comments`
--
ALTER TABLE `task_comments`
  ADD CONSTRAINT `task_comments_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `task_comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
