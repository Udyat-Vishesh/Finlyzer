# Finlyzer

**Finlyzer** is a full-stack AI-powered Portfolio Risk Analyzer that helps users make informed investment decisions. It allows users to select multiple assets (stocks, ETFs, crypto), define custom weights and date ranges, and view dynamic risk-return analytics—powered by real-time financial data and machine learning.

---

## Features

### Frontend (React)
- Real-time stock search with suggestions (via Yahoo Finance API)
- Custom date picker for historical analysis
- Portfolio return and risk metric graphs
- Clean and responsive UI (mobile-friendly)

### Backend (Flask)
- Fetches data from Yahoo Finance API using RapidAPI
- Handles portfolio logic (return, volatility, Sharpe ratio, etc.)
- Supports multiple asset types (stocks, ETFs, crypto)
- Easy integration of future AI modules (e.g., ML-based asset recommendations)

---

## Demo

*Coming soon:* A hosted version via Vercel (Frontend) and Render/Backend (Flask)

---

## Tech Stack

- **Frontend**: React, Tailwind CSS, Chart.js / Recharts
- **Backend**: Flask (Python), RapidAPI (Yahoo Finance API)
- **Deployment**: GitHub + Vercel (frontend), Render (backend)
- **Others**: GitHub Actions, .env configuration, responsive design

---

## Setup Instructions

### 1. Clone the repo

```bash
git clone https://github.com/Udyat-Vishesh/Finlyzer.git
cd Finlyzer

 cd frontend
npm install
npm run dev

cd backend
pip install -r requirements.txt
python app.py

Future Plans

AI-based investment recommendation

Authenticated user portfolios

Excel export for portfolio reports

Visual comparison graphs for individual asset performance



---

License

This project is under the MIT License.


---

Author

Udyat Vishesh
GitHub
