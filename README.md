# Knitto Backend Test API

Backend interview test with TypeScript, Express, and PostgreSQL.

---

## 🚀 Quick Start

### 1. Start Database

```bash
docker-compose up -d
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

### 4. Test API with Swagger

Open browser: **http://localhost:3000/api-docs**

---

## 📝 Test Flow

1. **Register/Login** (Authentication)

   - Go to `Authentication` section in Swagger
   - POST `/api/auth/register` with email & password
   - Copy the `accessToken`

2. **Authorize in Swagger**

   - Click 🔒 **Authorize** button (top right)
   - Paste token: `Bearer YOUR_ACCESS_TOKEN`
   - Click **Authorize**

3. **Test All Endpoints**
   - Try `/api/invoices` (create invoice)
   - Try `/api/dogs/random` (external API)
   - Try `/api/reports/system-summary` (reports)

---

## 🛑 Stop & Reset

```bash
# Stop services
docker-compose down

# Reset database (delete all data)
docker-compose down -v
docker-compose up -d
```

---

## 📚 API Endpoints

- **Auth**: `/api/auth/*`
- **Invoices**: `/api/invoices/*`
- **Dogs**: `/api/dogs/*`
- **Tasks**: `/api/tasks/*`
- **Transactions**: `/api/transactions/*`
- **Reports**: `/api/reports/*`

Full documentation: **http://localhost:3000/api-docs**

---

## ✅ Done!
