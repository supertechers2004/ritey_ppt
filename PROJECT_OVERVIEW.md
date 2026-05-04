# Ritey AI: Project Architecture & Documentation

Ritey AI is an intelligent presentation architect that automates the transition from a simple topic to a professional, research-backed PowerPoint presentation.

---

## 🏛️ Project Architecture
The system follows a modern decoupled architecture:
- **Frontend**: Next.js (Client-side rendering for the editor, Server-side for SEO).
- **Backend**: FastAPI (Asynchronous Python) managing AI orchestration.
- **AI Brain**: LangGraph (Stateful multi-agent system) + Groq (Llama 3.3).
- **Persistence**: PostgreSQL (User data, thread history, and AI state checkpointers).

---

## 📂 File & Directory Structure

### 🌐 Frontend (`/frontend`)
- `src/app/page.tsx`: Premium futuristic landing page.
- `src/app/(auth)/`: Login and Registration logic.
- `src/app/(app)/dashboard/`: User project library and recent activity.
- `src/app/(app)/ppt/[id]/`: Interactive editor where users review outlines and customize content.
- `src/components/navigation/`: Sidebar and TopBar management.
- `src/lib/api.ts`: Axios configuration for backend communication.

### ⚙️ Backend (`/backend`)
- `main.py`: Primary API entry point and route definitions.
- `graph.py`: LangGraph workflow definition (Agents, Nodes, and Conditional Edges).
- `models.py`: SQLAlchemy database models.
- `ppt_generator.py`: Core logic for creating `.pptx` files using `python-pptx`.
- `auth.py`: JWT-based security and password hashing.
- `schemas.py`: Pydantic models for request/response validation.

---

## 🗄️ Database Schema (PostgreSQL)

### `users` Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | Integer | Primary Key (Auto-increment) |
| `username` | String | Unique username for login |
| `hashed_password` | String | Bcrypt hashed password |
| `created_at` | DateTime | Account creation timestamp |

### `thread` Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `thread_id` | String | Primary Key (UUID) |
| `topic` | String | The presentation topic |
| `num_slide` | Integer | Total slides requested (default 5) |
| `img_path` | String | URL of the generated cover image (Pexels) |
| `theme` | String | Name of the selected PPTX template |
| `user_id` | Integer | Foreign Key linked to `users.id` |
| `updated_at` | DateTime | Last activity timestamp |

---

## 🛣️ API Route Map

### Authentication
- `POST /auth/register`: Create a new account.
- `POST /auth/login`: Authenticate and receive a JWT token.
- `GET /auth/me`: Retrieve current user details.

### Presentation Management
- `POST /threads/`: Create a new project thread.
- `GET /threads/`: List all presentations for the logged-in user.
- `GET /threads/{id}`: Get the full state of a specific presentation.
- `PUT /threads/{id}/outline`: Update the AI-generated outline with user edits.
- `DELETE /threads/{id}`: Permanently delete a project.

### AI Generation & Export
- `POST /states/`: Trigger the AI to generate an outline or detailed content.
- `POST /ppt/`: Build and download the `.pptx` file for an AI thread.
- `POST /ppt/custom/`: Build a `.pptx` from specific user-provided JSON data.

---

## 🧠 LangGraph AI Workflow
The generation process is stateful and divided into specific nodes:

1.  **Researcher Node**: Uses Tavily Search to find real-time data and statistics.
2.  **Outline Generator**: Creates a logical sequence of slide titles based on the topic.
3.  **Human-in-the-Loop (Interrupt)**: The system pauses and sends the outline to the user for approval/editing.
4.  **Designer Node**: For every slide title, it generates:
    - Bullet points and paragraphs.
    - An introductory line.
    - A specific **Image Query** for the Pexels API.
5.  **Tools Condition**: Automatically routes to the Search Tool if the AI needs more facts.

---

## 🔄 User Flow (Step-by-Step)

1.  **Landing**: User explores features and registers/logs in.
2.  **Creation**: User enters a topic (e.g., "Future of EVs") and slide count.
3.  **Outline Review**: The AI generates a list of slide titles. The user can rename, remove, or reorder them.
4.  **Content Build**: AI generates detailed text and finds matching high-quality images via Pexels.
5.  **Final Polish**: User previews the slides in the editor.
6.  **Export**: One-click download as a standard PowerPoint file with the chosen theme.

---

## 💎 Key Technical Innovations
- **Pexels Integration**: Automated image sourcing via API to replace manual searching.
- **Template Inheritance**: The backend dynamically maps content to native PPTX placeholders.
- **Atomic State Persistence**: If a user leaves mid-way, their progress is saved exactly where they left off in the AI workflow.
