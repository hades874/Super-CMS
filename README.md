# CMS360 Architectures: An Integrated Learning Platform

This is a comprehensive Learning Management System (LMS) built with Next.js and Firebase Studio. It provides a flexible and powerful platform for managing educational content for K-12, professional skill development, and creating and administering exams.

## Key Features

- **Exam Service**:
    - **Dynamic Exam Builder**: Create custom exams by dragging and dropping questions from a central bank.
    - **Comprehensive Question Bank**: Manage a large repository of questions with advanced filtering, search, and bulk management capabilities.
    - **AI-Powered Tools**:
        - **Question Suggester**: Generate balanced, multiple-choice question sets on any topic.
        - **Image-to-Question**: Upload an image of a document and automatically extract questions and options.
    - **CSV Import**: Bulk import questions from CSV files, with intelligent duplicate detection and attribute merging.
    - **Secure Exam Taking**: Students can take exams within a specific time window, with progress tracking and a final results summary.

- **K-12 Content Management**:
    - **Flexible Content Assignment**: A flexible system where content (like FB Live Classes) can be assigned to multiple Programs, Subjects, and Chapters simultaneously.
    - **"Steps" Visualization**: A centralized dashboard to view the relationships between all content and their assignments. Select any step (e.g., a specific Subject) to see all related content.
    - **Interactive Content Editing**: Assign content to different categories through an intuitive popup dialog.

- **IELTS Practice Module**:
    - A dedicated section for IELTS practice, simulating the Listening, Reading, Writing, and Speaking sections of the test.

- **Modern UI/UX**:
    - Built with ShadCN UI and Tailwind CSS for a professional and responsive design.
    - Includes a dark mode theme toggle.
    - Features a collapsible sidebar for easy navigation.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Generative AI**: [Google Genkit](https://firebase.google.com/docs/genkit)
- **Icons**: [Lucide React](https://lucide.dev/guide/packages/lucide-react)

## Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (version 18 or later)
- [npm](https://www.npmjs.com/) (or your preferred package manager like yarn or pnpm)

### Installation

1.  **Clone the repository**:
    ```sh
    git clone <your-repository-url>
    cd <project-directory>
    ```

2.  **Install dependencies**:
    ```sh
    npm install
    ```

### Running the Development Server

The application uses both a Next.js server for the frontend and a Genkit server for the AI capabilities. You will need to run them concurrently.

1.  **Start the Genkit development server**:
    Open a terminal and run:
    ```sh
    npm run genkit:dev
    ```
    This will start the Genkit server, typically on port 3400, and make the AI flows available.

2.  **Start the Next.js development server**:
    Open a second terminal and run:
    ```sh
    npm run dev
    ```
    This will start the main application on `http://localhost:9002`.

You can now open `http://localhost:9002` in your browser to view the application.

## Project Structure

Here's an overview of the key directories and files:

```
.
├── src
│   ├── app                 # Main application routes (App Router)
│   │   ├── exam-service    # Exam builder and related pages
│   │   ├── k12             # K-12 content management pages
│   │   ├── page.tsx        # Main landing page
│   │   └── layout.tsx      # Root layout
│   │
│   ├── ai                  # Genkit AI configuration and flows
│   │   ├── flows           # Genkit flow definitions (e.g., question generation)
│   │   └── genkit.ts       # Genkit initialization
│   │
│   ├── components          # Reusable React components
│   │   ├── k12             # Components specific to the K12 section
│   │   └── ui              # ShadCN UI components
│   │
│   ├── data                # Mock data and attribute mappings
│   │   ├── attribute-mapping.ts # Central source for all content attributes
│   │   ├── k12-content.ts  # Mock data for K12 content like FB Live Classes
│   │   └── mock-data.ts    # Sample questions for the question bank
│   │
│   ├── hooks               # Custom React hooks (e.g., useLocalStorage)
│   │
│   └── lib                 # Utility functions and libraries
│       └── utils.ts        # Helper functions (e.g., `cn` for classnames)
│
├── package.json            # Project dependencies and scripts
└── tailwind.config.ts      # Tailwind CSS configuration
```
