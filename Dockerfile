FROM python:3.13-slim

# System deps: gcc for psycopg, libpq for postgres
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps first (cached layer)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project structure
COPY alembic.ini .
COPY alembic/ ./alembic/
COPY backend/ ./backend/
COPY templates/ ./templates/
COPY media/ ./media/
COPY start_render.sh /start.sh
RUN chmod +x /start.sh

# FastAPI on 8000
EXPOSE 8000

CMD ["/start.sh"]