# Architectural Knowledge & Project Memory: EdFlex Super-CMS

This document serves as the "active memory" for the AI coding assistant, capturing design patterns, technical roadmaps, and project-specific knowledge.

## 1. Design & Aesthetic Standards

- **Theme**: "Tactical Premium"
- **Color Palette**:
  - Primary: Soft Purple (`#A085CF`)
  - Background: Light Lavender (`#F2F0FA`) / Dark Mode equivalent
  - Highlights: Muted Teal (`#73A7AD`)
- **Tone**: High-transparency, professional, and slightly "industrial/tactical" (e.g., "Content Payloads", "Sync to Core Repository").
- **Components**: ShadCN UI (Radix) with custom animations.

## 2. Technical Roadmap: IELTS Question Importer

Based on the plan established in previous sessions:

### Phase 1: Core MCQ & Basic Fillers (Current State)

- Implement basic CSV parsing for standard 4-option MCQs.
- Duplicate detection based on question text similarity.
- Basic localStorage persistence for local testing.

### Phase 2: Rich Content & Writing Tasks (Planned)

- Support for HTML/Markdown in question text.
- Writing Task 1/2 templates with word count constraints.
- Image mapping for Writing Task diagrams.

### Phase 3: Structural Complexity (Upcoming)

- Linked Passages: Reading Section mapping where 1 passage spans 10-15 questions.
- Listening Parts: Audio track mapping to specific question groups.
- Multi-section IELTS Tests: Consolidated `IeltsTest` object structure.

## 3. Data Schema Definitions

Key types stored in `@/types`:

- `Question`: Base type with attributes like `vertical`, `difficulty`, `topic`.
- `IeltsQuestion`: Extends `Question` with `ieltsType` (MCQ, FILL_BLANKS, MATCHING, etc.).
- `ReadingPassage`: Structural wrapper for IELTS Reading sections.
- `IeltsTest`: The top-level container for a full IELTS paper.

## 4. UI/UX Patterns

- **Studio Layout**: Collapsible sidebars, sticky table headers, and backdrop-blur effects.
- **Verification Flow**: All bulk uploads must go through a "Pre-Flight" preview screen before being committed to the core bank.
- **Action Feedbacks**: Use specific, punchy Toast notifications (e.g., "Signal Lost in Bank" for empty states, "Sync Successful" for imports).

## 5. Development Workflow

- Frontend: `npm run dev` (Port 9002)
- AI Logic: `npm run genkit:dev` (Port 3400)
- Deployment: Firebase/App Hosting configured via `apphosting.yaml`.
