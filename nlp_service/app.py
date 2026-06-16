import os
import json
import re
import nltk
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv
import google.generativeai as genai
from functools import lru_cache

# Load env variables and configure Gemini
load_dotenv()
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("WARNING: GEMINI_API_KEY not found in .env")

# Initialize FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Sastrawi stemmer
factory = StemmerFactory()
stemmer = factory.create_stemmer()

# Load NLTK stopwords
nltk.download('punkt', quiet=True)
nltk.download('punkt_tab', quiet=True)
nltk.download('stopwords', quiet=True)
from nltk.corpus import stopwords
stop_words = set(stopwords.words('indonesian'))

custom_stopwords = {'di', 'ke', 'dari', 'yang', 'dan', 'atau', 'untuk', 'dengan', 'ini', 'itu'}
stop_words = stop_words.union(custom_stopwords)

# Load dataset
DATA_PATH = os.path.join(os.path.dirname(__file__), 'data', 'wisata.json')
wisata_data = []

if os.path.exists(DATA_PATH):
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        wisata_data = json.load(f)
else:
    print(f"Dataset not found at {DATA_PATH}")

@lru_cache(maxsize=10000)
def stem_word(word):
    return stemmer.stem(word)

def preprocess_text(text):
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r'[^\w\s]', ' ', text)
    tokens = text.split()
    tokens = [w for w in tokens if w not in stop_words]
    tokens = [stem_word(w) for w in tokens]
    return ' '.join(tokens)

# Prepare corpus
corpus = []
for item in wisata_data:
    combined_text = f"{item.get('nama_wisata', '')} {item.get('kategori_wisata', '')} {item.get('deskripsi', '')} {item.get('lokasi', '')} {item.get('fasilitas', '')}"
    corpus.append(preprocess_text(combined_text))

# Initialize and fit TF-IDF
vectorizer = TfidfVectorizer()
if corpus:
    tfidf_matrix = vectorizer.fit_transform(corpus)

# Initialize model
model_flash = genai.GenerativeModel(
    model_name='gemini-2.5-flash',
    generation_config=genai.types.GenerationConfig(
        temperature=0.7,
    )
)
model_pro = genai.GenerativeModel(
    model_name='gemini-2.0-flash',
    generation_config=genai.types.GenerationConfig(
        temperature=0.7,
    )
)

class SearchRequest(BaseModel):
    query: str

class ChatRequest(BaseModel):
    message: str
    history: list = []

@app.get('/api')
def health_check():
    return {
        "status": 200,
        "message": "success",
        "service": "LUMIARA NLP API (FastAPI)"
    }

@app.post('/api/search')
def search_wisata(req: SearchRequest):
    try:
        query = req.query.strip()
        if not query:
            raise HTTPException(status_code=400, detail="Query string is required")
        
        processed_query = preprocess_text(query)
        
        # Intent Check
        prompt = f"""Apakah teks berikut berkaitan dengan pencarian tempat wisata, liburan, alam, fasilitas rekreasi, atau nama daerah/tempat?
Teks: "{query}"

PENTING: Jawab HANYA dengan kata "YA" jika berkaitan, atau "TIDAK" jika sama sekali tidak berkaitan."""
        try:
            intent_res = model_flash.generate_content(prompt)
            if "tidak" in intent_res.text.strip().lower():
                return {
                    'status': 'success',
                    'query': query,
                    'processed_query': processed_query,
                    'results': []
                }
        except Exception as e:
            print(f"LLM Intent Check failed: {e}")
            pass
            
        query_vec = vectorizer.transform([processed_query])
        similarities = cosine_similarity(query_vec, tfidf_matrix).flatten()
        related_docs_indices = similarities.argsort()[::-1]
        
        results = []
        for idx in related_docs_indices:
            sim_score = similarities[idx]
            if sim_score > 0.05:
                item = wisata_data[idx].copy()
                item['similarity_score'] = float(sim_score)
                results.append(item)
            if len(results) >= 10:
                break
                
        return {
            'status': 'success',
            'query': query,
            'processed_query': processed_query,
            'results': results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/api/chat')
def chat_bot(req: ChatRequest):
    try:
        message = req.message.strip()
        if not message:
            raise HTTPException(status_code=400, detail="Message is required")
            
        if not GEMINI_API_KEY:
            raise HTTPException(status_code=500, detail="Gemini API Key is not configured on the server. Please check .env file.")

        # Step 1: TF-IDF search
        processed_query = preprocess_text(message)
        
        results = []
        if processed_query.strip():
            query_vec = vectorizer.transform([processed_query])
            similarities = cosine_similarity(query_vec, tfidf_matrix).flatten()
            related_docs_indices = similarities.argsort()[::-1]
            
            for idx in related_docs_indices:
                sim_score = similarities[idx]
                if sim_score > 0.05:
                    item = wisata_data[idx].copy()
                    item['similarity_score'] = float(sim_score)
                    results.append(item)
                if len(results) >= 5:
                    break

        # Step 2: Build context
        if results:
            context_text = "Berikut adalah data wisata lokal (diurutkan berdasarkan relevansi dengan query):\n"
            for r in results:
                context_text += f"- ID: {r.get('id')}\n  Nama: {r.get('nama_wisata')}\n  Lokasi: {r.get('lokasi')}\n  Deskripsi: {r.get('deskripsi')}\n  Fasilitas: {r.get('fasilitas')}\n\n"
        else:
            context_text = "Tidak ada data wisata yang spesifik tercari dari database untuk query ini."

        # Format history
        history_text = ""
        if req.history:
            history_text = "Riwayat Percakapan (5 Terakhir):\n"
            for msg in req.history:
                sender = "Pengguna" if msg.get("sender") == "user" else "LUMIARA"
                history_text += f"{sender}: {msg.get('text')}\n"
            history_text += "\n"

        system_prompt = f"""Kamu adalah LUMIARA, asisten wisata Lampung yang gaul dan ramah. Balas dengan bahasa Indonesia yang santai dan natural. Jika soal wisata, gunakan DATA di bawah (jangan mengarang). Jika ngobrol santai, balas layaknya teman.

PENTING: Output jawabanmu HARUS dalam format JSON dengan tiga key:
1. "reply": string berisi teks jawabanmu untuk pengguna.
2. "show_cards": boolean (true/false). Berikan true HANYA JIKA pengguna spesifik mencari wisata atau bertanya rekomendasi. Berikan false jika pengguna basa-basi, curhat, bertanya pengetahuan umum, atau ngobrol di luar konteks wisata.
3. "recommended_ids": array of integer. Berisi list ID dari tempat wisata yang BENAR-BENAR kamu sebutkan/rekomendasikan di dalam teks "reply". Kosongkan array ini [] jika tidak ada wisata spesifik yang direkomendasikan.

{history_text}
DATA WISATA (Berdasarkan pesan terakhir):
{context_text}

Pesan Pengguna Saat Ini: "{message}"
"""

        # Step 3: Generate response
        try:
            response = model_flash.generate_content(
                system_prompt, 
                generation_config=genai.types.GenerationConfig(response_mime_type="application/json")
            )
        except Exception as api_err:
            print(f"Fallback to gemini-2.0-flash due to: {api_err}")
            response = model_pro.generate_content(
                system_prompt,
                generation_config=genai.types.GenerationConfig(response_mime_type="application/json")
            )
            
        try:
            raw_text = response.text.strip()
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]
            
            ai_data = json.loads(raw_text.strip())
            ai_reply = ai_data.get('reply', raw_text)
            show_cards = ai_data.get('show_cards', True)
            recommended_ids = ai_data.get('recommended_ids', [])
        except Exception as json_err:
            print(f"JSON Parse error: {json_err}. Raw text: {response.text}")
            match = re.search(r'"reply"\s*:\s*"([^"]+)', response.text, re.IGNORECASE | re.DOTALL)
            if match:
                ai_reply = match.group(1).replace('\\n', '\n').strip()
            else:
                ai_reply = "Maaf, respon saya terpotong. Bisa diulangi?"
            
            show_cards = True
            recommended_ids = []
            
        if not show_cards:
            results = []
        elif recommended_ids:
            results = [r for r in results if r.get('id') in recommended_ids]

        return {
            'status': 'success',
            'type': 'recommendation' if results else 'text',
            'response': ai_reply,
            'results': results if results else []
        }

    except Exception as e:
        print(f"Error in chat_bot: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=5000)