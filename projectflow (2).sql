-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 16, 2026 at 03:13 PM
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

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `user_id`, `project_id`, `action`, `entity_type`, `entity_id`, `details`, `created_at`) VALUES
(1, 2, 1, 'created_task', 'task', NULL, '{\"title\": \"Conduct UX Research & User Interviews\"}', '2026-04-03 06:05:58'),
(2, 2, 1, 'created_task', 'task', NULL, '{\"title\": \"Create Low-fidelity Wireframes\"}', '2026-04-03 06:05:58'),
(3, 2, 1, 'created_task', 'task', NULL, '{\"title\": \"Design High-fidelity Mockups\"}', '2026-04-03 06:05:58'),
(4, 2, 1, 'created_task', 'task', NULL, '{\"title\": \"Set Up React Project & Component Library\"}', '2026-04-03 06:05:58'),
(5, 2, 1, 'created_task', 'task', NULL, '{\"title\": \"Implement Homepage — Hero & Navigation\"}', '2026-04-03 06:05:58'),
(6, 2, 1, 'created_task', 'task', NULL, '{\"title\": \"Implement Services & Pricing Pages\"}', '2026-04-03 06:05:58'),
(7, 2, 1, 'created_task', 'task', NULL, '{\"title\": \"Write SEO-optimised Content\"}', '2026-04-03 06:05:58'),
(8, 2, 1, 'created_task', 'task', NULL, '{\"title\": \"Cross-browser & Mobile QA Testing\"}', '2026-04-03 06:05:58'),
(9, 2, 1, 'created_task', 'task', NULL, '{\"title\": \"Performance Optimisation\"}', '2026-04-03 06:05:58'),
(10, 2, 1, 'created_task', 'task', NULL, '{\"title\": \"Production Deployment & Go-Live\"}', '2026-04-03 06:05:58'),
(11, 1, 2, 'created_task', 'task', NULL, '{\"title\": \"Define App Architecture & Tech Stack\"}', '2026-04-03 06:05:58'),
(12, 1, 2, 'created_task', 'task', NULL, '{\"title\": \"Design Onboarding Flow\"}', '2026-04-03 06:05:58'),
(13, 1, 2, 'created_task', 'task', NULL, '{\"title\": \"Implement Push Notifications (Firebase)\"}', '2026-04-03 06:05:58'),
(14, 1, 2, 'created_task', 'task', NULL, '{\"title\": \"Build Offline Mode with SQLite\"}', '2026-04-03 06:05:58'),
(15, 1, 2, 'created_task', 'task', NULL, '{\"title\": \"Implement Dark Theme\"}', '2026-04-03 06:05:58'),
(16, 1, 2, 'created_task', 'task', NULL, '{\"title\": \"App Store & Play Store Submission\"}', '2026-04-03 06:05:58'),
(17, 1, 2, 'created_task', 'task', NULL, '{\"title\": \"QA & Device Testing\"}', '2026-04-03 06:05:58'),
(18, 2, 3, 'created_task', 'task', NULL, '{\"title\": \"Design Integration Architecture\"}', '2026-04-03 06:05:58'),
(19, 2, 3, 'created_task', 'task', NULL, '{\"title\": \"Stripe Payment Integration\"}', '2026-04-03 06:05:58'),
(20, 2, 3, 'created_task', 'task', NULL, '{\"title\": \"Twilio SMS & WhatsApp Integration\"}', '2026-04-03 06:05:58'),
(32, 2, 7, 'created_project', 'project', 7, '{\"name\":\"Foodrush\"}', '2026-04-03 06:27:39'),
(33, 1, 8, 'created_project', 'project', 8, '{\"name\":\"Project management tool\"}', '2026-04-13 09:40:07'),
(34, 2, 7, 'updated_project', 'project', 7, '{\"name\":\"Foodrush\"}', '2026-04-15 09:21:48'),
(35, 2, 7, 'updated_project', 'project', 7, '{\"name\":\"Foodrush\"}', '2026-04-15 09:22:00'),
(36, 2, 7, 'updated_project', 'project', 7, '{\"name\":\"Foodrush\"}', '2026-04-15 09:22:34');

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
(1, '1775028562786-692319928.xlsx', 'MSFT BizApps Upload File.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '/uploads/documents/1775028562786-692319928.xlsx', 25956, 1, 6, NULL, '2026-04-01 07:29:22'),
(2, '1775542996859-873302853.xlsx', 'QC.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '/uploads/documents/1775542996859-873302853.xlsx', 387849, 2, 7, NULL, '2026-04-07 06:23:16'),
(3, '1775543835346-21321940.xlsx', '1775542996859-873302853.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '/uploads/documents/1775543835346-21321940.xlsx', 387849, 2, 7, NULL, '2026-04-07 06:37:15');

-- --------------------------------------------------------

--
-- Table structure for table `goals`
--

CREATE TABLE `goals` (
  `id` int(11) NOT NULL,
  `title` varchar(300) NOT NULL,
  `description` text DEFAULT NULL,
  `type` enum('team','personal') DEFAULT 'personal',
  `status` enum('On track','At risk','Off track','Achieved','Paused') DEFAULT 'On track',
  `progress` int(11) DEFAULT 0,
  `owner_id` int(11) NOT NULL,
  `time_period` varchar(50) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `goals`
--

INSERT INTO `goals` (`id`, `title`, `description`, `type`, `status`, `progress`, `owner_id`, `time_period`, `due_date`, `created_at`, `updated_at`) VALUES
(1, 'Create All Task Before Friday', 'Create All Task Before Friday', 'personal', 'On track', 0, 4, '3 day', '2026-04-18', '2026-04-14 09:21:53', '2026-04-14 09:21:53'),
(2, 'Our goal is complete HRM Project before end of the month', 'NA', 'team', 'At risk', 0, 4, '23 day', '2026-05-07', '2026-04-14 09:26:13', '2026-04-14 09:26:13');

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

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `project_id`, `user_id`, `message`, `file_url`, `file_name`, `file_type`, `parent_message_id`, `seen_by`, `created_at`) VALUES
(1, 7, 1, 'Hey', NULL, NULL, NULL, NULL, '[3, 7, 2, 4]', '2026-04-03 06:31:48'),
(2, 7, 3, 'Hello Admin', NULL, NULL, NULL, NULL, '[7, 2, 1, 4]', '2026-04-03 09:09:50'),
(3, 5, 3, 'hey', NULL, NULL, NULL, NULL, '[4, 1, 8]', '2026-04-03 09:36:30'),
(4, 7, 2, 'HEY team can you help me for creating image', NULL, NULL, NULL, NULL, '[1, 4]', '2026-04-07 06:22:54'),
(7, 6, 8, 'Hey team i have done my all task', NULL, NULL, NULL, NULL, '[1, 2]', '2026-04-07 06:29:08'),
(8, 3, 2, 'Hello team', NULL, NULL, NULL, NULL, NULL, '2026-04-15 09:26:48'),
(9, 6, 2, NULL, '/uploads/chat-files/1776345014939-611372781.xlsx', 'MSFT BizApps Upload File.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', NULL, '[8]', '2026-04-16 13:10:14');

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

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `body`, `link`, `is_read`, `created_at`) VALUES
(1, 8, 'task_assigned', 'New Task Assigned', 'You have been assigned: Create banner image', '/projects/6/board', 0, '2026-04-02 12:03:26'),
(2, 4, 'task_assigned', 'New Task Assigned', 'You have been assigned: create banner image', '/projects/7/board', 0, '2026-04-07 06:21:07'),
(3, 3, 'task_assigned', 'New Task Assigned', 'You have been assigned: Dashboard', '/projects/7/board', 0, '2026-04-07 11:32:31'),
(4, 1, 'task_assigned', 'New Task Assigned', 'You have been assigned: Create About Page', '/projects/7', 1, '2026-04-14 09:05:57'),
(5, 4, 'task_assigned', 'New Task Assigned', 'You have been assigned: Update About page UI', '/projects/5', 0, '2026-04-14 09:19:05'),
(6, 8, 'task_assigned', 'New Task Assigned', 'You have been assigned: Create banner image', '/projects/8', 1, '2026-04-16 04:46:39');

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
(6, 'Foodrush Ecommerce', 'create e-commerce website like flipkart ', 'Active', 1, '2026-04-01 04:29:24', '2026-04-01 04:29:24'),
(7, 'Foodrush', 'Create e commerce Website', 'Completed', 2, '2026-04-03 06:27:38', '2026-04-15 09:22:34'),
(8, 'Project management tool', 'Create project management tool .', 'Active', 1, '2026-04-13 09:40:07', '2026-04-13 09:40:07');

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
(25, 6, 2, 'Member', '2026-04-01 04:29:25'),
(26, 7, 2, 'Owner', '2026-04-03 06:27:38'),
(27, 7, 1, 'Member', '2026-04-03 06:27:39'),
(28, 7, 4, 'Member', '2026-04-03 06:27:39'),
(29, 7, 3, 'Member', '2026-04-03 06:27:39'),
(30, 8, 1, 'Owner', '2026-04-13 09:40:07'),
(32, 8, 6, 'Member', '2026-04-13 09:40:07'),
(33, 8, 3, 'Member', '2026-04-13 09:40:07'),
(34, 8, 8, 'Member', '2026-04-13 09:40:07'),
(35, 5, 8, 'Member', '2026-04-13 09:40:48'),
(36, 7, 7, 'Member', '2026-04-14 12:59:07');

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
  `status` enum('To Do','In Progress','In Review','Done') DEFAULT 'To Do',
  `priority` enum('Low','Medium','High') DEFAULT 'Medium',
  `due_date` date DEFAULT NULL,
  `position` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_bug` tinyint(1) DEFAULT 0,
  `reopened_count` int(11) DEFAULT 0,
  `time_estimate` int(11) DEFAULT NULL,
  `time_spent` int(11) DEFAULT 0,
  `start_date` date DEFAULT NULL,
  `section` varchar(100) DEFAULT 'Recently assigned'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `project_id`, `title`, `description`, `assigned_to`, `created_by`, `status`, `priority`, `due_date`, `position`, `created_at`, `updated_at`, `is_bug`, `reopened_count`, `time_estimate`, `time_spent`, `start_date`, `section`) VALUES
(1, 1, 'Conduct UX Research & User Interviews', 'Interview 10 existing customers to understand pain points with the current website. Document findings in Notion.', 4, 2, 'Done', 'High', '2024-02-15', 0, '2024-01-12 04:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(2, 1, 'Create Low-fidelity Wireframes', 'Design wireframes for Home, About, Services, Contact, and Blog pages using Figma.', 4, 2, 'Done', 'High', '2024-02-28', 1, '2024-01-15 05:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(3, 1, 'Design High-fidelity Mockups', 'Convert wireframes into full-colour Figma designs. Follow the new brand guidelines document.', 4, 2, 'Done', 'High', '2024-03-20', 2, '2024-02-01 03:30:00', '2026-04-14 09:16:25', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(4, 1, 'Set Up React Project & Component Library', 'Bootstrap the React 18 project with Vite, configure ESLint/Prettier, set up Storybook for the component library.', 3, 2, 'Done', 'High', '2024-03-14', 0, '2024-02-05 04:30:00', '2026-04-14 09:17:29', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(5, 1, 'Implement Homepage — Hero & Navigation', 'Build the responsive hero section and sticky navigation. Must pass Lighthouse accessibility score ≥ 90.', 3, 2, 'To Do', 'Medium', '2024-04-05', 1, '2024-02-10 05:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(6, 1, 'Implement Services & Pricing Pages', 'Build the Services listing page with filter tabs and the Pricing page with toggle (monthly/annual).', 3, 2, 'To Do', 'Medium', '2024-04-15', 2, '2024-02-10 06:00:00', '2026-03-27 03:51:45', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(7, 1, 'Write SEO-optimised Content', 'Rewrite all page copy targeting the new keyword clusters. Min 1500 words for blog posts.', NULL, 2, 'Done', 'Low', '2024-04-19', 3, '2024-02-12 03:30:00', '2026-04-15 09:20:04', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(8, 1, 'Cross-browser & Mobile QA Testing', 'Test on Chrome, Firefox, Safari, Edge. Mobile breakpoints: 375px, 768px, 1024px. Log bugs in GitHub Issues.', 5, 2, 'Done', 'High', '2024-04-30', 0, '2024-02-12 04:30:00', '2026-03-27 11:29:23', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(9, 1, 'Performance Optimisation', 'Achieve LCP < 2.5s, CLS < 0.1. Implement image lazy loading, code splitting, CDN for static assets.', 3, 2, 'To Do', 'Medium', '2024-05-10', 1, '2024-02-15 03:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(10, 1, 'Production Deployment & Go-Live', 'Deploy to AWS Amplify. Configure custom domain, SSL certificate, and set up CloudFront distribution.', 3, 2, 'To Do', 'High', '2024-05-31', 2, '2024-02-15 04:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(11, 2, 'Define App Architecture & Tech Stack', 'Document the architecture: React Native with Expo, state management (Zustand), navigation (React Navigation v6).', 3, 1, 'Done', 'High', '2024-02-10', 0, '2024-01-16 03:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(12, 2, 'Design Onboarding Flow', '5-screen onboarding with animations. Include skip option. Connect to analytics to track drop-off.', 4, 1, 'Done', 'Medium', '2024-02-20', 1, '2024-01-16 04:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(13, 2, 'Implement Push Notifications (Firebase)', 'Set up Firebase Cloud Messaging for iOS and Android. Handle foreground/background/terminated states.', 3, 1, 'In Progress', 'High', '2024-03-25', 0, '2024-02-01 03:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(14, 2, 'Build Offline Mode with SQLite', 'Use expo-sqlite to cache critical data locally. Implement sync-on-reconnect with conflict resolution.', 3, 1, 'In Progress', 'High', '2024-04-01', 1, '2024-02-05 04:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(15, 2, 'Implement Dark Theme', 'Add dark/light theme toggle using React Navigation theming. Persist preference in AsyncStorage.', 4, 1, 'Done', 'Medium', '2024-04-09', 0, '2024-02-10 03:30:00', '2026-04-09 11:53:14', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(16, 2, 'App Store & Play Store Submission', 'Prepare screenshots (all sizes), write store descriptions, handle review feedback. Target both stores simultaneously.', NULL, 1, 'To Do', 'High', '2024-05-15', 1, '2024-02-10 04:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(17, 2, 'QA & Device Testing', 'Test on iPhone 12/14/15, Samsung Galaxy S22/S24, Pixel 7. Use BrowserStack for additional device coverage.', 5, 1, 'To Do', 'High', '2024-05-01', 0, '2024-02-15 04:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(18, 3, 'Design Integration Architecture', 'Create system design document: message queue (RabbitMQ), retry policy, dead letter queue, monitoring approach.', 3, 2, 'Done', 'High', '2024-02-15', 0, '2024-02-02 03:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(19, 3, 'Stripe Payment Integration', 'Implement payment intents, webhooks for subscription events, and refund handling. Include test coverage.', 3, 2, 'In Progress', 'High', '2024-03-10', 0, '2024-02-10 03:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(20, 3, 'Twilio SMS & WhatsApp Integration', 'Send OTPs, order updates, and marketing messages via Twilio. Build template management UI.', 3, 2, '', 'Medium', '2024-03-24', 1, '2024-02-10 04:30:00', '2026-04-03 05:27:33', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(21, 3, 'SendGrid Email Service', 'Transactional emails: welcome, password reset, invoices. Build drag-drop email template editor.', 2, 2, '', 'Medium', '2024-04-03', 2, '2024-02-15 03:30:00', '2026-04-03 05:25:14', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(22, 3, 'Integration Monitoring Dashboard', 'Real-time dashboard showing API call volumes, error rates, latency percentiles, and integration health scores.', 2, 2, '', 'Low', '2024-04-19', 3, '2024-02-15 04:30:00', '2026-04-03 05:27:05', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(23, 4, 'Requirements Gathering', 'Workshops with HR team to document all required features and workflows.', 6, 6, 'Done', 'High', '2023-11-15', 0, '2023-11-02 03:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(24, 4, 'Database Schema Design', 'Design tables for employees, leave requests, payroll, and announcements.', 1, 6, 'Done', 'High', '2023-11-30', 1, '2023-11-05 04:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(25, 4, 'Build Leave Request Module', 'Employees submit requests, managers approve/reject with email notifications.', 4, 6, 'Done', 'High', '2023-12-20', 2, '2023-11-10 03:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(26, 4, 'Build Payroll Slip Viewer', 'Secure PDF viewer for monthly payroll slips. Download option with audit trail.', 1, 6, 'Done', 'Medium', '2024-01-05', 3, '2023-11-15 04:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(27, 4, 'User Acceptance Testing', 'HR team tests all modules. Gather feedback, fix bugs, re-test.', 5, 6, 'Done', 'High', '2024-01-20', 0, '2023-12-01 03:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(28, 4, 'Production Launch', 'Deploy to company servers, migrate existing HR data, train HR team.', 1, 6, 'Done', 'High', '2024-01-31', 1, '2023-12-15 04:30:00', '2026-03-27 03:51:45', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(29, 5, 'Create Dashboard', 'hey sam create Dashboard', 3, 1, 'Done', 'Low', '2026-03-27', 0, '2026-03-27 10:26:17', '2026-04-01 04:34:49', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(30, 3, 'Home page', 'Create home page', 2, 2, 'Done', 'Medium', '2026-04-01', 0, '2026-03-27 12:21:42', '2026-04-03 05:25:02', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(31, 4, 'Create Chatbox', 'Create chatbox like whatsapp', 4, 1, 'Done', 'Medium', '2026-04-04', 0, '2026-03-30 12:25:57', '2026-04-14 09:16:28', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(32, 6, 'Dashboard', 'Hey sam create dahboard for ecommerce', 8, 1, 'Done', 'Low', '2026-04-01', 0, '2026-04-01 04:30:19', '2026-04-07 06:28:35', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(33, 5, 'Create images', 'Hey start work on images ', 4, 4, 'Done', 'Low', '2026-04-16', 0, '2026-04-01 04:34:41', '2026-04-14 09:16:23', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(34, 5, 'create banner image', 'create banner image', 4, 4, 'Done', 'High', '2026-03-30', 0, '2026-04-01 07:33:43', '2026-04-01 07:35:18', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(35, 5, 'Create Logos', 'create logo for HRM', 4, 4, 'Done', 'High', '2026-04-02', 0, '2026-04-01 07:34:10', '2026-04-14 09:16:20', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(36, 5, 'create ui design for dashboard', 'create ui design for dashboard', 4, 4, 'Done', 'High', '2026-04-02', 0, '2026-04-01 07:34:45', '2026-04-03 06:23:15', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(37, 6, 'Create banner image', 'Hey team please start work on images ', 8, 2, 'Done', 'Medium', '2026-04-07', 0, '2026-04-02 12:03:26', '2026-04-02 12:04:06', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(38, 6, 'Create Dashboard', 'NA', 2, 2, 'In Review', 'Medium', '2026-04-05', 0, '2026-04-03 06:07:20', '2026-04-07 06:28:40', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(39, 7, 'Create home page', 'Using React Create Home page', 2, 2, 'Done', 'Medium', '2026-04-02', 0, '2026-04-03 06:28:29', '2026-04-07 06:21:38', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(40, 7, 'Create About page', 'Create about page using React', 2, 2, 'Done', 'Medium', '2026-04-03', 0, '2026-04-03 06:29:03', '2026-04-03 06:29:28', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(41, 7, 'create banner image', 'create banner image ', 4, 2, 'Done', 'Low', '2026-04-06', 0, '2026-04-07 06:21:07', '2026-04-07 06:36:35', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(42, 6, 'Update user dahboard design', 'Update user dashboard design', 8, 8, 'Done', 'High', '2026-04-07', 0, '2026-04-07 06:30:48', '2026-04-07 06:31:50', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(43, 7, 'Dashboard', 'create user dashboard', 3, 2, 'Done', 'Medium', '2026-04-08', 0, '2026-04-07 11:32:31', '2026-04-14 09:04:43', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(44, 7, 'Create About Page', 'Hey Alex can you create About page', 1, 4, 'Done', 'Medium', '2026-04-14', 0, '2026-04-14 09:05:57', '2026-04-14 09:15:41', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(45, 5, 'Update About page UI', 'Update About page UI', 4, 4, 'In Progress', 'Medium', '2026-04-14', 0, '2026-04-14 09:19:05', '2026-04-14 09:19:42', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(46, 6, 'Create User login page', 'Hey team create User login page', 2, 2, 'Done', 'Medium', '2026-04-15', 0, '2026-04-15 08:52:34', '2026-04-15 09:23:50', 0, 0, NULL, 0, NULL, 'Recently assigned'),
(47, 8, 'Create banner image', 'Create banner image', 8, 8, 'To Do', 'Medium', '2026-04-17', 0, '2026-04-16 04:46:39', '2026-04-16 04:46:39', 0, 0, NULL, 0, NULL, 'Recently assigned');

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
-- Table structure for table `todos`
--

CREATE TABLE `todos` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(300) NOT NULL,
  `is_done` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `todos`
--

INSERT INTO `todos` (`id`, `user_id`, `title`, `is_done`, `created_at`) VALUES
(1, 1, 'HRM changes pending', 0, '2026-04-13 09:27:25'),
(2, 8, 'create home page', 1, '2026-04-14 09:09:30'),
(3, 8, 'Do all task by EOD', 0, '2026-04-16 04:41:45');

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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `theme` varchar(10) DEFAULT 'dark'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `avatar`, `created_at`, `updated_at`, `theme`) VALUES
(1, 'Alex Admin', 'admin@projectflow.com', '$2b$10$K7P4Zz5zTSGyNeWL45crXekujQ/6L2mkDZh/TbOAvhAucEbtk5VmK', 'Admin', NULL, '2024-01-01 02:30:00', '2026-03-27 09:25:05', 'dark'),
(2, 'Sarah Manager', 'sarah.manager@projectflow.com', '$2b$10$K7P4Zz5zTSGyNeWL45crXekujQ/6L2mkDZh/TbOAvhAucEbtk5VmK', 'Manager', NULL, '2024-01-02 03:30:00', '2026-03-27 09:25:05', 'dark'),
(3, 'John Developer', 'john.dev@projectflow.com', '$2b$10$K7P4Zz5zTSGyNeWL45crXekujQ/6L2mkDZh/TbOAvhAucEbtk5VmK', 'Employee', NULL, '2024-01-03 04:30:00', '2026-03-27 09:25:05', 'dark'),
(4, 'Emily Designer', 'emily.design@projectflow.com', '$2b$10$MnxPyTx/AT2zdSxAJdXveeZwYUL7LO2xXBkhdGd.D6sXVsG2DbpJ6', 'Employee', NULL, '2024-01-04 05:00:00', '2026-04-01 04:35:44', 'dark'),
(5, 'Mike QA', 'mike.qa@projectflow.com', '$2b$10$K7P4Zz5zTSGyNeWL45crXekujQ/6L2mkDZh/TbOAvhAucEbtk5VmK', 'Employee', NULL, '2024-01-05 05:30:00', '2026-03-27 09:25:05', 'dark'),
(6, 'Lisa Manager', 'lisa.manager@projectflow.com', '$2b$10$K7P4Zz5zTSGyNeWL45crXekujQ/6L2mkDZh/TbOAvhAucEbtk5VmK', 'Manager', NULL, '2024-01-06 06:00:00', '2026-03-27 09:25:05', 'dark'),
(7, 'Admin User', 'admin@test.com', '$2b$10$K7P4Zz5zTSGyNeWL45crXekujQ/6L2mkDZh/TbOAvhAucEbtk5VmK', 'Admin', 'NULL', '2026-03-27 06:15:49', '2026-03-27 09:25:05', 'dark'),
(8, 'Sam Gore', 'sam.gore@projectflow.com', '$2b$10$4h50HGZRNOIgdONvHnGvxO0r1e0N4rKZrfKF3QESV9JtXaysWKvG.', 'Employee', NULL, '2026-03-31 09:14:41', '2026-03-31 09:14:41', 'dark');

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
-- Indexes for table `goals`
--
ALTER TABLE `goals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `owner_id` (`owner_id`);

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
-- Indexes for table `todos`
--
ALTER TABLE `todos`
  ADD PRIMARY KEY (`id`),
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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `goals`
--
ALTER TABLE `goals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `project_users`
--
ALTER TABLE `project_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `task_comments`
--
ALTER TABLE `task_comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `todos`
--
ALTER TABLE `todos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
-- Constraints for table `goals`
--
ALTER TABLE `goals`
  ADD CONSTRAINT `goals_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

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

--
-- Constraints for table `todos`
--
ALTER TABLE `todos`
  ADD CONSTRAINT `todos_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
