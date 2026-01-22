# LakshayIndia AWS Deployment (Quick + Scalable)

You asked for the fastest safe path for ~250–500 concurrent users.

## Recommendation (quickest + cleanest)
**Option A (fastest): Single EC2 + Nginx reverse-proxy + SQLite on EBS**
- One domain: `https://lakshayindia.biz`
- Nginx serves the React build and proxies `/api/*` to Node backend on localhost.
- No CORS pain (same-origin).
- Cheapest + simplest.

**When to upgrade**: If traffic or writes grow, or you need multi-instance autoscaling, move DB to Postgres (RDS) and run backend in ECS/ASG.

---

## Can EC2 handle 250–500 concurrent?
Yes, for typical CRUD + simple slot/game requests:
- Start with **t3.medium** (2 vCPU / 4GB) or **t3.small** (2 vCPU / 2GB) as minimum.
- If you see CPU > 70% during peak, move to t3.large.

**Important**: Your DB is SQLite. It supports concurrency but writes are serialized. For heavy write traffic, Postgres is better.

---

## Option A — Step-by-step (EC2 + Nginx)

### 1) AWS setup
1. Create an EC2 Ubuntu 22.04 instance
   - Instance: `t3.medium`
   - Storage: 20–40GB gp3
2. Allocate an **Elastic IP** and attach to the instance.
3. Security Group inbound:
   - 22 (SSH) from your IP
   - 80 (HTTP) from anywhere
   - 443 (HTTPS) from anywhere

### 2) Domain (GoDaddy)
Fastest: point DNS to the Elastic IP.
- Create **A record**: `@` -> `<ElasticIP>`
- Create **A record**: `www` -> `<ElasticIP>`

### 3) Copy code to server
From your local machine:
- `scp -r ./LuckIndia ubuntu@<ElasticIP>:/home/ubuntu/app`

Or use git:
- `git clone <your-repo-url> /home/ubuntu/app`

### 4) Server install (run on EC2)
SSH:
- `ssh ubuntu@<ElasticIP>`

Then run:
- `sudo apt update`
- `sudo apt install -y nginx certbot python3-certbot-nginx`

Install Node 20 (recommended):
- `curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -`
- `sudo apt install -y nodejs build-essential`

(Optional) process manager:
- `sudo npm i -g pm2`

### 5) Backend env
Create `/home/ubuntu/app/backend/.env`:
- `PORT=4000`
- `NODE_ENV=production`
- `JWT_SECRET=<random-long-secret>`
- `JWT_EXPIRES_IN=12h`
- `DB_PATH=./db/luckindia.sqlite`
- `CORS_ORIGINS=https://lakshayindia.biz,https://www.lakshayindia.biz`

Start backend:
- `cd /home/ubuntu/app/backend && npm ci`
- `pm2 start server.js --name lakshayindia-backend`
- `pm2 save`

### 6) Frontend build
- `cd /home/ubuntu/app/frontend && npm ci`
- `npm run build`

This produces `frontend/dist`.

### 7) Nginx config (same domain)
Create `/etc/nginx/sites-available/lakshayindia`:
```nginx
server {
  listen 80;
  server_name lakshayindia.biz www.lakshayindia.biz;

  root /home/ubuntu/app/frontend/dist;
  index index.html;

  location /api/ {
    proxy_pass http://127.0.0.1:4000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

Enable:
- `sudo ln -s /etc/nginx/sites-available/lakshayindia /etc/nginx/sites-enabled/lakshayindia`
- `sudo nginx -t && sudo systemctl reload nginx`

### 8) HTTPS certificate
- `sudo certbot --nginx -d lakshayindia.biz -d www.lakshayindia.biz`

Done.

---

## Option B — S3 + CloudFront (frontend) + EC2 (backend)
Use this if you want the best static performance.
- Frontend on S3/CloudFront (domain `lakshayindia.biz`)
- Backend either:
  - `api.lakshayindia.biz` on EC2/ALB
  - OR still same domain with CloudFront behavior routing `/api/*` to the API origin

This is more setup than Option A but scales very well.

---

## What you need to provide (so I can guide precisely)
I **don’t need your passwords/keys** here.
Just answer these:
1. Choose **Option A** (single EC2) or **Option B** (S3+CloudFront + API).
2. Region preference (e.g. `ap-south-1` Mumbai).
3. Do you want `www` to work too? (recommended: yes)
4. Will you keep SQLite for now, or move to Postgres (RDS)?

Then I’ll give you exact commands for your chosen option.
