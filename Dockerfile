# ACIS Production Dockerfile
# Optimized for high-throughput FastAPI and Computer Vision Simulators

FROM python:3.10-slim-buster

WORKDIR /app

# Install system dependencies for OpenTelemetry and OpenCV
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose FastAPI port
EXPOSE 8000

# Start the ACIS Nervous System
CMD ["uvicorn", "server.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
