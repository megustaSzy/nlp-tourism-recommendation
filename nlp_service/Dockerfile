# Gunakan base image Python 3.9 yang ringan
FROM python:3.9-slim

# Set working directory awal
WORKDIR /app

# Salin file requirements.txt terlebih dahulu
COPY requirements.txt .

# Install semua dependencies (termasuk FastAPI, Uvicorn, dll)
RUN pip install --no-cache-dir -r requirements.txt

# Hugging Face Spaces mewajibkan penggunaan non-root user untuk alasan keamanan
# Buat user baru dengan User ID 1000
RUN useradd -m -u 1000 user

# Beralih menggunakan user tersebut
USER user

# Set environment variables untuk user path
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

# Ganti working directory ke folder home milik user
WORKDIR $HOME/app

# Salin seluruh kode aplikasi (termasuk folder data/wisata.json) ke dalam container
# dengan hak akses milik user tersebut
COPY --chown=user . $HOME/app

# Ekpos port 7860 (Port standar yang wajib digunakan di Hugging Face Docker Spaces)
EXPOSE 7860

# Perintah untuk menjalankan FastAPI menggunakan Uvicorn di port 7860
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
