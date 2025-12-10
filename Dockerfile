# Use official Python runtime as a parent image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies for OpenCV and ML libraries
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
