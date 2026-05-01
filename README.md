# 🤖 AnnotateAI

> AI-powered image annotation platform · YOLO + Google Gemini · Full-stack web app

[![Live](https://img.shields.io/badge/live-annotateai.it-0066CC)](https://annotateai.it)
[![Backend](https://img.shields.io/badge/backend-Render-46E3B7)](https://annotateai.onrender.com/health)
[![License](https://img.shields.io/badge/license-MIT-blue)]()

---

## 🌐 Live Demo

- **Frontend:** https://annotateai.it (or https://annotateai.vercel.app)
- **Backend API:** https://annotateai.onrender.com
- **Health check:** https://annotateai.onrender.com/health

⚠️ Free tier: backend may take 30-60s to wake up on first request.

---

## ✨ Features

- 🤖 **AI detection** — YOLO v8 finds 80+ object classes
- ✨ **Rich metadata** — Google Gemini 2.5 extracts brand, color, age, breed, etc.
- 🔐 **JWT authentication** — bcrypt hashed passwords + role-based access (user/admin/guest)
- 🏷 **Annotation workflow** — review pending detections, approve / edit / skip / discard
- 📚 **CRM-style history** — paginated table with filters, bulk delete, multi-format export
- 📥 **Bulk import** — ZIP, JSON, CSV, XLSX support
- 🌐 **33 languages** — Google Translate integration
- 🎨 **Dark / light theme** — auto-detects system preference
- 📱 **Mobile responsive** — works seamlessly across devices
- 🐳 **Dockerized** — one-command deployment

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router, Material Symbols |
| Backend | Python 3.12, Flask, Flask-JWT-Extended |
| AI/ML | Ultralytics YOLOv8, Google Gemini 2.5 Flash |
| Database | MongoDB Atlas (cloud) |
| DevOps | Docker, Docker Compose, Git |
| Deployment | Vercel (frontend) + Render (backend) |
| Auth | JWT + bcrypt |

---

## 🏗 Architecture

```
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│  React Frontend  │ ──REST──┤  Flask Backend   │ ──────► │  MongoDB Atlas   │
│  Vercel          │  + JWT  │  Render          │         │  Frankfurt       │
│  annotateai.it   │         │  YOLO + Gemini   │         │                  │
└──────────────────┘         └──────────────────┘         └──────────────────┘
```

---

## 🚀 Quick Start (Docker)

```bash
git clone https://github.com/teodorina-ted/annotateai.git
cd annotateai

# Add your Gemini API key
echo "GEMINI_API_KEY=your_key_here" > .env
echo "MONGO_URI=mongodb+srv://..." >> .env

# Boot everything
docker-compose up --build
```

Open `http://localhost:5000` for the API and `http://localhost:3000` for the React frontend.

---

## 🧑‍💻 Local Development

### Backend

```bash
cd image-gallery
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py
```

### Frontend

```bash
cd frontend
npm install
npm start
```

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /register | — | Create account (with email) |
| POST | /login | — | Returns JWT + role |
| POST | /detect | optional | Run YOLO + Gemini on image |
| GET | /images | required | List user's detections |
| GET | /images/:id | required | Get one detection |
| PUT | /images/:id | required | Update labels / status |
| DELETE | /images/:id | required | Delete one detection |
| POST | /images/bulk-delete | required | Delete multiple |
| GET | /profile | required | User profile |
| GET | /health | — | Health check |

---

## 📂 Project Structure

```
annotateai/
├── app/
│   ├── __init__.py
│   ├── routes/        # auth.py, detect.py, images.py
│   └── models/        # user.py
├── frontend/
│   ├── src/
│   │   ├── pages/     # Landing, Auth, Home, Detect, History, Profile, Import
│   │   ├── components/
│   │   └── utils/
│   └── package.json
├── Dockerfile
├── docker-compose.yml
├── render.yaml
├── requirements.txt
└── run.py
```

---

## 🎓 Academic Context

Final project for the **DevOps course** at **ITS Olivetti**, A.A. 2025/2026.

**Requirements satisfied:**
- ✅ Python + Flask backend
- ✅ MongoDB document database
- ✅ JWT authentication
- ✅ Docker + Docker Compose
- ✅ REST API
- ✅ Modern frontend (React)
- ✅ AI integration (YOLO)
- ✅ **Bonus:** live deployment + custom domain

---

## 📞 Author

**Teodorina Lungu**
📧 teodorina.business@gmail.com
🔗 [LinkedIn](https://www.linkedin.com/in/teodorina-lungu-631577172) · [GitHub](https://github.com/teodorina-ted)

---

## 📄 License

MIT
README_EOF

cd ~/image-gallery
git add README.md
git commit -m "Add comprehensive README"
git push
```

