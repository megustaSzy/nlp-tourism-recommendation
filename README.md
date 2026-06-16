# LUMINAIRA - Smart Tourism Village Lampung 🏝️

LUMINAIRA adalah platform sistem rekomendasi wisata pintar berbasis **Natural Language Processing (NLP)** yang berfokus pada desa wisata di Provinsi Lampung. Pengguna dapat mencari destinasi wisata menggunakan bahasa sehari-hari (natural language), dan sistem akan memberikan rekomendasi yang paling relevan menggunakan algoritma TF-IDF dan Cosine Similarity.

---

## 🚀 Fitur Utama
- **Natural Language Search**: Mencari tempat wisata dengan kalimat santai (Contoh: "Pantai yang sepi dan cocok untuk camping").
- **Intelligent Recommendation**: Menggunakan pembobotan kata (TF-IDF) untuk akurasi pencarian.
- **Village Directory**: Informasi lengkap mengenai desa wisata di Lampung.
- **Responsive Design**: Tampilan modern yang nyaman diakses dari perangkat apa pun.

---

## 🛠️ Tech Stack & Versi
### Frontend
- **Framework**: Next.js 15+
- **Styling**: Tailwind CSS
- **Language**: TypeScript

### Backend
- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Database**: PostgreSQL

### NLP Service
- **Language**: Python 3.9+
- **Framework**: Flask
- **Libraries**: NLTK, Sastrawi, Scikit-learn (TF-IDF, Cosine Similarity)

---

## ⚙️ Setup & Instalasi

Pastikan Anda sudah menginstal **Node.js**, **Python**, dan **PostgreSQL** di komputer Anda.

### 1. Clone Repositori
```bash
git clone https://github.com/megustaSzy/nlp-tourism-recommendation.git
cd nlp-tourism-recommendation
```

### 2. Setup NLP Service (Python)
```bash
cd nlp_service
python -m venv venv
# Windows: venv\Scripts\activate
# Linux/Mac: source venv/bin/activate
pip install flask flask-cors nltk sastrawi scikit-learn pandas
python app.py
```

### 3. Setup Backend (Node.js)
```bash
cd ../backend
npm install
# Sesuaikan .env dengan kredensial database Anda
npm run dev
```

### 4. Setup Frontend (Next.js)
```bash
cd ../frontend
npm install
npm run dev
```

---

## 🖥️ Contoh Penggunaan
Setelah semua layanan berjalan, buka browser di `http://localhost:3000`.

**Input Pengguna:**
> "Saya ingin mencari pantai di Lampung Selatan yang ada fasilitas camping dan harganya murah."

**Hasil Rekomendasi:**
1. **Pantai Kedu Warna** (Skor Kemiripan: 0.85) - Lokasi: Kalianda.
2. **Pantai Bagus Kalianda** (Skor Kemiripan: 0.72) - Lokasi: Lampung Selatan.

---

## 📁 Struktur Proyek
- `/frontend`: Aplikasi client-side menggunakan Next.js.
- `/backend`: API server menggunakan Express.js.
- `/nlp_service`: Layanan pemrosesan bahasa menggunakan Python Flask.
- `wisata.json`: Dataset awal destinasi wisata.
- `start.bat`: Script otomatis untuk menjalankan semua layanan (khusus Windows).

---

© 2026 LUMINAIRA Project - Developed for Lampung Tourism Innovation.
