import os
import json
import re
import nltk
from flask import Flask, request, jsonify
from flask_cors import CORS
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize Sastrawi stemmer
factory = StemmerFactory()
stemmer = factory.create_stemmer()

# Load NLTK stopwords
nltk.download('punkt')
nltk.download('punkt_tab')
nltk.download('stopwords')
from nltk.corpus import stopwords
stop_words = set(stopwords.words('indonesian'))

# Add some custom stopwords if necessary
custom_stopwords = {'di', 'ke', 'dari', 'yang', 'dan', 'atau', 'untuk', 'dengan', 'ini', 'itu'}
stop_words = stop_words.union(custom_stopwords)

# Load dataset
DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'wisata.json')
wisata_data = []

if os.path.exists(DATA_PATH):
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        wisata_data = json.load(f)
else:
    print(f"Dataset not found at {DATA_PATH}")

def preprocess_text(text):
    if not isinstance(text, str):
        return ""
    # Lowercase
    text = text.lower()
    # Remove punctuation
    text = re.sub(r'[^\w\s]', ' ', text)
    # Tokenization
    tokens = nltk.word_tokenize(text)
    # Stopword Removal
    tokens = [word for word in tokens if word not in stop_words]
    # Stemming
    tokens = [stemmer.stem(word) for word in tokens]
    return ' '.join(tokens)

# Prepare corpus
corpus = []
for item in wisata_data:
    # Combine fields to create a rich document
    combined_text = f"{item.get('nama_wisata', '')} {item.get('kategori_wisata', '')} {item.get('deskripsi', '')} {item.get('lokasi', '')} {item.get('fasilitas', '')}"
    corpus.append(preprocess_text(combined_text))

# Initialize and fit TF-IDF
vectorizer = TfidfVectorizer()
if corpus:
    tfidf_matrix = vectorizer.fit_transform(corpus)

@app.route('/api/search', methods=['POST'])
def search_wisata():
    try:
        data = request.get_json()
        query = data.get('query', '')
        if not query:
            return jsonify({'status': 'error', 'message': 'Query string is required'}), 400
        
        # Preprocess query
        processed_query = preprocess_text(query)
        
        # Transform query
        query_vec = vectorizer.transform([processed_query])
        
        # Calculate cosine similarity
        similarities = cosine_similarity(query_vec, tfidf_matrix).flatten()
        
        # Get top 10 results (or less depending on matching)
        # We only want results with similarity > 0
        related_docs_indices = similarities.argsort()[::-1]
        
        results = []
        for idx in related_docs_indices:
            sim_score = similarities[idx]
            if sim_score > 0.05:  # threshold
                item = wisata_data[idx].copy()
                item['similarity_score'] = float(sim_score)
                results.append(item)
                
            if len(results) >= 10:
                break
                
        return jsonify({
            'status': 'success',
            'query': query,
            'processed_query': processed_query,
            'results': results
        })
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
