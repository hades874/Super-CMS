# Product Requirements Document: EdFlex Exam Builder & LMS

**Author:** App Prototyper AI
**Version:** 1.0
**Date:** October 26, 2023

---

## 1. Introduction

### 1.1. Overview
EdFlex is a comprehensive, integrated learning platform designed for educational institutions and instructors. It combines a powerful Learning Management System (LMS) for organizing curriculum with a sophisticated Exam Service for creating, administering, and analyzing assessments. The platform is built to be flexible, supporting content and exams for K-12 education, professional skill development, and specialized tests like the IELTS.

### 1.2. Target Audience
- **Teachers & Instructors:** Primary users who will create curriculum structures, upload content, build exams, and monitor student progress.
- **Curriculum/Content Managers:** Administrators responsible for organizing the overall educational structure and managing the central content repository.
- **Students:** End-users who will take exams and (in future iterations) consume content.

### 1.3. Goals & Objectives
- **Empower Instructors:** Provide a seamless, intuitive interface for creating and managing educational content and assessments without requiring deep technical expertise.
- **Centralize Content:** Create a single source of truth for all questions and learning materials, making them reusable, searchable, and easy to manage.
- **Flexible Curriculum Mapping:** Allow for a many-to-many relationship between content and curriculum structure (Programs, Courses, Chapters).
- **Leverage AI:** Utilize artificial intelligence to streamline repetitive tasks like question generation and to provide intelligent suggestions.
- **Data-Driven Insights:** Provide a clear overview of platform activity and content distribution through an integrated dashboard.

---

## 2. Core Features

### 2.1. Dashboard
- **Purpose:** To provide an at-a-glance overview of all platform content and activity.
- **Requirements:**
    - Display key statistics in visually distinct "Stat Cards."
    - **Dynamic Counters:** All statistics should be dynamically calculated based on the data within the application.
    - **Metrics to Display:**
        - Total Questions
        - Question Sets
        - FB Live Classes
        - Resources (e.g., Lecture Slides)
        - Active Users (placeholder)
        - AI Activity (placeholder)
        - Exams Created
        - Platform Settings (placeholder)
    - **Content Distribution Chart:** A bar chart visualizing the number of items for each major content type (Total Questions, MCQ, CQ, IELTS, etc.).

### 2.2. Content Management
- **Purpose:** A hierarchical system for organizing the entire curriculum.
- **Requirements:**
    - **Programs:** The highest level of organization (e.g., "HSC 2025," "Medical Admission"). Users can create, edit, and delete programs.
    - **Courses:** A sub-level within Programs (e.g., "Physics 1st Paper"). Courses must belong to a program. Users can create, edit, and delete courses, filtered by the selected program.
    - **Chapters:** The most granular level, belonging to a Course (e.g., "Chapter 1: Vectors"). Users can create, edit, and delete chapters, filtered by the selected course.
    - **All Content View:** Centralized pages for managing all content of a specific type (FB Live, Zoom Class, Exam, etc.).

### 2.3. Content Assignment System
- **Purpose:** To link content items to one or more parts of the curriculum structure.
- **Requirements:**
    - An "Assign" button shall be available for all relevant content types (Exams, FB Live, Zoom, Resources).
    - **Assignment Dialog:** A modal dialog that allows users to select one or more assignment paths.
        - Utilizes cascading dropdowns: Program -> Course -> Chapter.
        - Users can "stage" multiple assignment paths (e.g., assign a video to both Chapter 1 of a Physics course and Chapter 3 of a Math course).
        - A review area shows staged assignments before saving.
    - **Steps Page:** A dedicated visualization tool to see all relationships.
        - Displays a table-based overview of top-level curriculum components (Programs).
        - Each item has "Steps" and "Chapter" action buttons, providing entry points to manage deeper assignments (functionality of these buttons is a future enhancement).

### 2.4. Question Bank
- **Purpose:** A central repository for all assessment questions, with robust filtering, management, and creation tools.
- **Sub-Modules:**
    - **MCQ Questions:** For standard multiple-choice questions.
    - **CQ (Creative Questions):** For passage-based questions with multiple sub-questions.
    - **IELTS Questions:** For questions specifically formatted for IELTS tests.
- **Core Functionality (for each sub-module):**
    - **Advanced Filtering:** Search by text and filter by multiple attributes (Vertical, Program, Subject, Topic, Difficulty, etc.).
    - **Table View:** A sortable and selectable list of all questions.
    - **Bulk Actions:** Select multiple questions to perform actions like "Delete Selected."
    - **CRUD Operations:** View details, Edit, and Delete individual questions through a dropdown menu on each row.
    - **AI & Import Tools:**
        - **Bulk Upload System:** Import questions from a CSV file (or by pasting CSV text). The system provides a template, a parsing/preview step, and handles duplicate detection by merging attributes.
        - **Generate from Image (OCR):** Upload an image of a document, and have AI extract the questions and options automatically.
        - **AI Suggester (MCQ only):** Generate a balanced set of new MCQ questions based on a topic and an optional prompt.

### 2.5. Exam Service
- **Purpose:** To construct and configure exams using questions from the bank.
- **Requirements:**
    - **Exam Creation Page:** A dedicated UI for building a new exam.
    - **Exam Type Selection:** User first selects the type of exam (MCQ, CQ, Practice, IELTS types). The UI adapts to show relevant configuration fields.
    - **Exam Configuration (for MCQ/CQ):**
        - Exam Title & auto-generated Slug.
        - Start and End Date/Time for the exam window.
        - Duration in minutes.
        - Scoring: Total marks, negative marking, pass percentage.
    - **Question Composition:** A component that allows users to open the Question Bank in a dialog, filter, and select questions to add to the current exam.
    - **Save/Publish:** Options to save the exam as a draft or publish it.

### 2.6. Exam Taking & Results
- **Purpose:** A secure and timed environment for students to take exams.
- **Requirements:**
    - **Exam Lobby:** If an exam has not started, a waiting screen is displayed with a countdown timer.
    - **Timed Interface:** Once started, a persistent timer shows the remaining time. The exam auto-submits when the timer reaches zero.
    - **Navigation:** "Next" and "Previous" buttons to move between questions. A progress bar shows completion status.
    - **Answer Submission:** Users select answers (e.g., via radio buttons). The system records the final selected answers.
    - **Results Page:**
        - Displays the final score as a percentage.
        - A pie chart visualizes the breakdown of Correct, Incorrect, and Unanswered questions.
        - A detailed review section lists each question, the user's answer, and the correct answer.

---

## 3. Design & Style Guidelines

- **Primary Color:** Soft purple (`#A085CF`)
- **Background Color:** Light lavender (`#F2F0FA`)
- **Accent Color:** Muted teal (`#73A7AD`)
- **Font:** Inter (sans-serif)
- **UI Components:** ShadCN UI library with Tailwind CSS for styling.
- **Layout:** A modern, professional layout featuring a collapsible sidebar for navigation and a main content area. A dark mode theme is available.
- **Icons:** Lucide React for clear, consistent, and lightweight icons.

---

## 4. High-Level Estimated Timeline

This timeline assumes a dedicated development team of 2-3 engineers.

| Phase                       | Description                                                                                                                   | Estimated Duration |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| **Week 1-2: Foundation & Setup** | Project initialization (Next.js), theme setup (Tailwind, ShadCN), navigation (sidebar, header), and core layout structure. | 2 Weeks            |
| **Week 3-4: Content Management Core** | Build the pages and logic for creating and managing Programs, Courses, and Chapters. Implement local storage persistence.    | 2 Weeks            |
| **Week 5-7: Question Bank & MCQ** | Build the core Question Bank UI. Implement MCQ management, filtering, and CRUD operations. Implement AI Suggester.             | 3 Weeks            |
| **Week 8-9: Bulk & Image Upload** | Implement the CSV bulk upload system with duplicate detection. Integrate the AI-powered image-to-question (OCR) feature.  | 2 Weeks            |
| **Week 10-11: Exam Creation & Config** | Develop the Exam Creation page, including type selection, configuration fields, and the Question Composition dialog.           | 2 Weeks            |
| **Week 12: CQ & IELTS Modules** | Extend the Question Bank to support CQ and IELTS question types, including their specific import and management logic.      | 1 Week             |
| **Week 13: Content Assignment** | Build the `AssignmentContext` and the `AssignContentDialog`. Integrate "Assign" buttons across all content views.           | 1 Week             |
| **Week 14: Steps & Dashboard**  | Develop the "Steps" visualization page. Build the main Dashboard with dynamic stat cards and charts.                       | 1 Week             |
| **Week 15-16: Exam Taking & Results** | Create the front-end for the timed exam-taking experience and the final results page with charts and detailed review.      | 2 Weeks            |
| **Week 17: Testing & Refinement** | End-to-end testing, bug fixing, performance optimization, and final UI/UX polish.                                           | 1 Week             |
| **Total Estimated Time**        |                                                                                                                               | **17 Weeks**       |

---
