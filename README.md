# He thong quan ly mon an

MSSV: 236974
Ho ten: Lam Thai Nguyen

## Gioi thieu
Xay dung he thong quan ly mon an tren nen tang dam may.

## Cong nghe
- React, Vite
- Node.js, Express
- MongoDB Atlas
- GitHub
- Docker, Docker Hub
- Render

## Cau truc du an
- backend/: Backend API
- frontend/: Giao dien React

## Chuc nang
- Xem danh sach mon an
- Xem chi tiet mon an
- Them mon an
- Sua mon an
- Xoa mon an
- Tim kiem mon an

## Cai dat

Backend:
cd backend
npm install

Frontend:
cd frontend
npm install
npm run dev

## Trien khai
URL Docker Hub va Render se duoc cap nhat sau.
## MongoDB Atlas

Database: 236974_LamThaiNguyen

Collection: foods

Du lieu mau:
- MA001: Pho bo
- MA002: Com tam
- MA003: Bun bo Hue

Backend su dung MongoDB Atlas.
Cau hinh ket noi trong backend/.env
## Docker Backend

Docker Hub:
https://hub.docker.com/r/thainguyen3103/backend

Docker image:
thainguyen3103/backend:1.0

Build:
docker build -t thainguyen3103/backend:1.0 ./backend

Chay Docker:
docker run -d --name food-backend -p 5001:5000 --env-file backend/.env thainguyen3103/backend:1.0

Kiem tra API:
http://localhost:5001/health
http://localhost:5001/api/foods