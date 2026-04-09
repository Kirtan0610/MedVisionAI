# MedVision AI - Comprehensive Project Guide

This guide will help you set up and run the MedVision AI project on your local machine.

## Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **MongoDB** (A cloud URI or local instance)
- **AI Access**: A [Groq API Key](https://console.groq.com/keys) (Used for LLaMA 3 analysis)

---

## 🚀 Getting Started

Follow these steps to get everything running:

### 1. Clone the Repository
```bash
git clone <your-repo-link>
cd medvision-ai
```

### 2. Backend Setup
1. Open a terminal in the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (if not already present) and add these keys:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=any_long_secret_string
   GROQ_API_KEY=your_groq_api_key
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open a new terminal in the `frontend` directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and point it to your backend:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

---

## 📄 Other Tools

### Technical Documentation Generator
The `generate_doc.py` script helps create the project report automatically.
1. Install Python requirements:
   ```bash
   pip install -r requirements.txt
   ```
2. Run the script:
   ```bash
   python generate_doc.py
   ```

---

## 🛠️ Tech Stack
- **Frontend**: React.js, Tailwind CSS, Vite, Leaflet (Maps)
- **Backend**: Node.js, Express.js, MongoDB (Mongoose)
- **AI**: Groq (LLaMA 3.3-70B model)
- **PDF**: pdf2json (for automated report reading)
