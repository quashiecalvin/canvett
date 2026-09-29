# Canvett backend container for Fly.io
# Python 3.11 slim keeps the image small; the CPU-only torch wheel (pinned in
# requirements.txt via the pytorch.org extra index) keeps memory and image size
# down so the service fits comfortably in a 2 GB machine.
FROM python:3.11-slim

# System packages: build tools are only needed if a wheel has to compile; keep
# the layer lean and clean up afterwards.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PORT=8080 \
    HF_HOME=/app/.hf

WORKDIR /app

# Install Python dependencies first so this layer is cached across code changes.
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Pre-download the sentence-transformers model into the image so the first
# request after a deploy or restart is fast and does not depend on Hugging Face
# being reachable at runtime.
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

# Copy the application code.
COPY . .

EXPOSE 8080

# Bind to 0.0.0.0 and honour the PORT Fly provides.
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080} --proxy-headers --forwarded-allow-ips='*'"]
