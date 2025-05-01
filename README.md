
# SG Neighbourhood Moodmap

![image](https://github.com/user-attachments/assets/3251fe27-1a51-4184-922b-90affa59b3a4)

A full-stack web application that analyzes the mood and sentiment of Singapore neighbourhoods based on Reddit comments.

Built with:
- Node.js + Express backend
- React + Vite + TypeScript frontend
- Python scripts for custom sentiment analysis
- Reddit API + Google Gemini API

---

## Project Purpose

The project aims to provide an overall view of public sentiments towards various Singapore neighbourhoods.
Users can analyze either real-time Reddit comments or a sample local dataset, and visualize sentiment trends across different areas. An AI-powered chatbot (Gemini) also allows users to ask questions related to the sentiment data.

---

## Live Demo

You can try the live version of this project here:

<a href="https://sg-neighbourhood-moodmap-website.onrender.com/" target="_blank">SG Neighbourhood Moodmap Live Website</a>

> Note: The backend server may take up to 5 minutes to wake up after inactivity due to free hosting limitations. Please be patient if the loading screen appears.

---

## Key Features

- **Two data sources**: 
  - Local dummy dataset (CSV)
  - Live Reddit comment scraping
- **Two sentiment analysis models**: 
  - Pre-trained VADER model
  - Custom-trained machine learning model
- **Interactive graph plotting**:
  - Visualizes comment sentiment trends for neighbourhoods with 3+ comments
- **AI Chatbot (Gemini API)**:
  - Ask questions related to the analysed data for additional insights
- **Flexible backend and frontend setup**:
  - Backend (Node.js + Python)
  - Frontend (React + Vite)

---

## Project Structure

```
/client  → Frontend (React + Vite + TypeScript)
/server  → Backend (Express + Node.js + Python scripts)
```

---

##  Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/sg-neighbourhood-moodmap.git
cd sg-neighbourhood-moodmap
```

### 2. Backend Setup

```bash
cd server
npm install
```
> Installs Node.js backend dependencies.

### 3. Frontend Setup

```bash
cd client
npm install
```
> Installs React frontend dependencies.

### 4. Python Environment Setup (for Sentiment Analysis)

Inside `/server/`:

```bash
python -m venv .venv
```

Activate virtual environment:

| OS | Command |
|:---|:--------|
| Windows (PowerShell) | `.venv\Scripts\Activate` |
| Windows (CMD) | `.venv\Scripts\activate.bat` |
| macOS/Linux | `source .venv/bin/activate` |

Install Python dependencies:

```bash
pip install -r requirements.txt
```

---

### 5. Running the Project

Inside `/server/`:

```bash
npm run dev-all
```

This will:
- Start backend server (`node index.js`)
- Start frontend (`npm run dev` inside `/client`)

If backend is slow to boot, frontend will retry API calls until backend is ready.

---

## Available Scripts

| Script | Description |
|:-------|:------------|
| `npm run dev` | Start backend server only (`node index.js`) |
| `npm run client` | Start frontend only (`npm run dev` inside `/client`) |
| `npm run dev-all` | Start both backend and frontend together using `npm-run-all` |
| `npm run lint` | Run ESLint to check backend code |

---

## Environment Variables

Create a `.env` file inside `/server/`:

```
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USER_AGENT=your_user_agent
GEMINI_API_KEY=your_gemini_api_key
```

> A sample `.env.example` is provided for reference.

---

## Troubleshooting

| Problem | Solution |
|:--------|:---------|
| Frontend fetch errors at startup | Backend may still be starting. Frontend will retry automatically. |
| Python script errors | Ensure `.venv` is activated and dependencies installed. |
| `npm-run-all` not recognized | Run `npm install` inside `/server`. |
| `node` not recognized | Ensure Node.js is installed (`node -v` to check). |

---

## Technologies Used

- Frontend: React, Vite, TypeScript
- Backend: Node.js, Express
- Python for Sentiment Analysis
- Reddit API
- Google Gemini API
- ESLint for backend linting

---

## License

This project is intended for educational and portfolio purposes.
