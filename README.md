# LUMINAIRA - Smart Tourism Village Lampung 🏝️

LUMINAIRA adalah platform sistem rekomendasi wisata pintar berbasis **Natural Language Processing (NLP)** yang berfokus pada desa wisata di Provinsi Lampung. Pengguna dapat mencari destinasi wisata menggunakan bahasa sehari-hari (natural language), dan sistem akan memberikan rekomendasi yang paling relevan menggunakan algoritma TF-IDF dan Cosine Similarity. 

Sistem ini kini dilengkapi dengan **Asisten Chatbot AI (Gemini 1.5)** yang memiliki fitur memori percakapan untuk interaksi yang lebih personal dan natural.

---

## 🚀 Fitur Utama
- **Generative AI Chatbot**: Asisten virtual cerdas berbasis arsitektur RAG yang dapat diajak mengobrol dan merekomendasikan wisata.
- **Natural Language Smart Search**: Mencari tempat wisata dengan kalimat santai (Contoh: "Pantai yang sepi dan cocok untuk camping").
- **Intelligent Recommendation**: Menggunakan pembobotan kata (TF-IDF) untuk akurasi pencarian.
- **Serverless Architecture**: Kecepatan *loading* tingkat *enterprise* dengan mekanisme *caching* otomatis menggunakan TanStack Query.
- **Responsive & Modern Design**: Tampilan antarmuka Glassmorphism yang nyaman diakses dari perangkat apa pun.

---

## 🛠️ Tech Stack & Versi
### Frontend (Serverless)
- **Framework**: Next.js 15+ (App Router & API Routes)
- **Data Fetching**: TanStack Query (React Query)
- **Styling**: Tailwind CSS
- **Language**: TypeScript

### NLP Service & AI
- **Language**: Python 3.9+
- **Framework**: FastAPI & Uvicorn (Asynchronous I/O)
- **AI Model**: Google Gemini 1.5 Flash (google-generativeai)
- **Libraries**: NLTK, Sastrawi, Scikit-learn, Pydantic

*(Catatan: Proyek ini tidak lagi bergantung pada Express.js maupun PostgreSQL karena telah bermigrasi sepenuhnya ke arsitektur Serverless Next.js dan FastAPI NoSQL).*

---

## ⚙️ Setup & Instalasi (Local Development)

Pastikan Anda sudah menginstal **Node.js** dan **Python** di komputer Anda.

### 1. Clone Repositori
```bash
git clone https://github.com/megustaSzy/nlp-tourism-recommendation.git
cd nlp-tourism-recommendation
```

### 2. Setup NLP Service (Python FastAPI)
```bash
cd nlp_service
python -m venv venv
# Windows: venv\Scripts\activate
# Linux/Mac: source venv/bin/activate
pip install -r requirements.txt

# Buat file .env dan isi dengan GEMINI_API_KEY=KODE_API_ANDA
python app.py
```
*Service akan berjalan di `http://localhost:5000`*

### 3. Setup Frontend (Next.js)
```bash
cd ../frontend
npm install

# Sesuaikan file .env.local dengan:
# NEXT_PUBLIC_API_URL=/api
# NEXT_PUBLIC_NLP_API_URL=http://localhost:5000/api

npm run dev
```
*Frontend akan berjalan di `http://localhost:3000`*

---

## ☁️ Panduan Deployment (Production)

### A. Deploy NLP Service (Hugging Face Spaces)
1. Buat **Space baru** di Hugging Face (Pilih SDK **Docker**).
2. *Upload* seluruh isi folder `nlp_service` (termasuk folder `data`, `Dockerfile`, dan `requirements.txt`).
3. Tambahkan `GEMINI_API_KEY` di menu **Settings > Variables and secrets**.
4. Salin *Direct URL* Space Anda (Contoh: `https://username-lumiara-nlp.hf.space`).

### B. Deploy Frontend (Vercel)
1. Hubungkan *repository* GitHub Anda ke Vercel dan *import* folder `frontend`.
2. Di bagian **Environment Variables**, tambahkan:
   - `NEXT_PUBLIC_API_URL` = `/api`
   - `NEXT_PUBLIC_NLP_API_URL` = `https://username-lumiara-nlp.hf.space/api` *(Ubah dengan URL Hugging Face Anda)*.
3. Klik **Deploy**. Selesai!

---

## 📁 Struktur Proyek
- `/frontend`: Aplikasi UI dan rute internal menggunakan Next.js.
- `/nlp_service`: Layanan AI, Chatbot, dan algoritma pencarian menggunakan FastAPI.
- `wisata.json`: Basis data statis (NoSQL) destinasi wisata.

---

© 2026 LUMINAIRA Project - Developed for Lampung Tourism Innovation.
