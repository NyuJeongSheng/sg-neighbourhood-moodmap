# Server: Node.js (Express API) + Python (sentiment analysis pipeline)
FROM node:20-slim

# Install Python for the sentiment analysis / model training scripts,
# which the Node process spawns via `python ...` at runtime.
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 python3-pip \
    && ln -s /usr/bin/python3 /usr/bin/python \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Node dependencies first to leverage Docker layer caching
COPY package*.json ./
RUN npm ci --omit=dev

# Install Python dependencies
COPY requirements.txt ./
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

# App source
COPY . .

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "index.js"]
