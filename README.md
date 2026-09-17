# Activity Report Document-to-Data Automation

A streamlined, full-stack web application designed for extracting structured data and images from Activity Reports (`.docx` and `.pdf`), validating and editing them, and exporting approved records to **Google Sheets, CSV, Excel (.xlsx)** and uploading categorized images to **Google Drive**.

---

## Key Features

1. **Clean Business UI (Zero AI-Chatbot Bloat)**:
   - Designed strictly for document and data operations: Drag-and-drop queue, multi-doc batch table, split-screen reviewer with image categorization, and export configuration modal.
2. **Targeted Extraction (The 8 Target Fields)**:
   - General Information (Title, Type, Date, Time, Venue, Collaboration)
   - Speaker / Guest Details (Name, Title/Position, Organization, Presentation Title)
   - Participant Profile (Type of Participants, Number of Participants)
   - Synopsis
   - Highlights
   - Key Objectives / Takeaways
   - Summary
   - Follow-up Plan
   - *(Feedback and Impact Analysis sections are strictly omitted).*
3. **Extracted Image Organization**:
   - Categorizes images into `Event_Poster`, `Photos`, and `Attendance`.
   - Allows users to re-tag or re-categorize images before export.
   - Uploads to Google Drive using the exact folder hierarchy:
     ```
     Activity Reports / 2026 / {Event_Name} /
         ├── Event_Poster/
         ├── Photos/
         └── Attendance/
     ```
4. **Duplicate Protection & Conflict Handling (CSV & Excel)**:
   - Never automatically overwrites an existing file.
   - If a file collision occurs, displays file path, size, last modified date, and existing row count.
   - Offers 3 clear options:
     1. **Append to existing file**
     2. **Create new file (timestamped unique name)**
     3. **Cancel**
5. **Google Sheets Export**:
   - Export using signed-in account or connect a secondary account.
   - Append to existing spreadsheet or create a new formatted sheet with frozen headers.
   - Real-time destination preview before writing.
6. **Zero Database Architecture**:
   - No SQLite, MySQL, Postgres, Mongo, or Firebase.
   - Ephemeral session memory + local temporary storage for files and thumbnails.

---

## Quick Start

### 1. Launch with One Click (Windows)
Double-click:
```
run_app.bat
```
This starts both the FastAPI backend and Vite frontend automatically.

---

### 2. Manual Startup

#### Backend:
```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

#### Frontend:
```bash
cd frontend
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## Google OAuth Setup (For Sheets & Drive Export)

To enable direct export to Google Sheets and Drive:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project.
3. Enable **Google Sheets API** and **Google Drive API**.
4. Configure the OAuth Consent Screen (add test users or publish).
5. Create OAuth 2.0 Client ID Credentials (Application type: **Web application**).
6. Set the Authorized Redirect URI to:
   ```
   http://localhost:8000/api/auth/google/callback
   ```
7. Download the credentials JSON and save it as:
   ```
   backend/credentials.json
   ```
*(See `backend/credentials.json.example` for reference).*
