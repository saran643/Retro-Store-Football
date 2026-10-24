# RETRO STORE — Football E-Commerce Website

> **"THE BEAUTIFUL GAME. FOREVER."**  
> A complete, functional, responsive football e-commerce platform built for Indian football fans, featuring classic retro kits, modern jerseys, match boots, anti-slip grip socks, shin guards, goalkeeper gloves, and accessories at accessible Indian Rupee (₹) pricing.

---

## 1. Project Architecture & Tech Stack

- **Frontend**: React.js (Vite), React Router v6, Axios, Lucide React, Vanilla CSS3 Design System with Vintage Cream (`#F5F0E6`), Deep Black (`#171717`), and Burgundy (`#721C32`).
- **Backend**: Node.js & Express.js REST API with modular controllers, services, middleware, Helmet security headers, CORS, Express Rate Limiting, and Multer image uploads.
- **Database**: MySQL relational database (`retro_store_db`) with 11 relational tables, foreign key constraints, indexes, and atomic ACID transactions for order placement and stock deduction.
- **Security**: 12-round bcrypt password hashing, signed JSON Web Tokens (JWT), role-based access control (RBAC), SQL injection prevention via parameterized queries, and defensive input validation.

---

## 2. Directory Structure

```text
retro/
├── client/                     # React + Vite Frontend Application
│   ├── src/
│   │   ├── assets/             # Brand logos & media assets
│   │   ├── components/         # Navbar, Footer, ProductCard, ProductImage, Route Guards
│   │   ├── context/            # AuthContext, CartContext, WishlistContext, ToastContext
│   │   ├── layouts/            # MainLayout, AdminLayout
│   │   ├── pages/              # Home, Shop, ProductDetails, Cart, Wishlist, Checkout, Account...
│   │   │   └── admin/          # AdminDashboard, AdminProducts, AdminCategories, AdminOrders...
│   │   ├── services/           # Axios API client & INR currency formatters
│   │   ├── styles/             # variables.css, main.css, components.css, admin.css
│   │   ├── App.jsx             # Route definitions & guards
│   │   └── main.jsx            # React root entry
│   ├── index.html              # HTML5 entry with Google Fonts & SEO meta tags
│   ├── vite.config.js          # Vite config with API proxy
│   └── package.json            # Client dependencies
│
├── server/                     # Node.js + Express REST API Server
│   ├── config/                 # db.js (MySQL pool connection & transaction helpers)
│   ├── controllers/            # auth, product, cart, wishlist, order, admin controllers
│   ├── middleware/             # verifyToken, requireAdmin, upload (Multer)
│   ├── routes/                 # authRoutes, productRoutes, cartRoutes, orderRoutes, adminRoutes
│   ├── scripts/                # init-db.js (automated schema & seed runner)
│   ├── uploads/products/       # Uploaded product image storage
│   ├── app.js                  # Express app setup, Helmet, CORS, routers
│   ├── server.js               # Server bootstrap & MySQL connection verification
│   └── package.json            # Server dependencies
│
├── database/                   # Database Deliverables
│   ├── schema.sql              # Relational DDL schema (11 tables with foreign keys)
│   └── seed.sql                # Seed data with all 11 categories & authentic football products
│
├── scripts/                    # Utility & Test Automation Scripts
│   ├── create-admin.js         # Command-line administrator account generator
│   └── test-workflows.js       # End-to-end automated integration test suite
│
├── .env.example                # Template environment variables
├── .gitignore                  # Git ignore rules
├── package.json                # Root convenience scripts
└── README.md                   # Complete Windows setup guide and documentation
```

---

## 3. Database Schema (`retro_store_db`)

The relational database consists of 11 structured tables:

1. `users`: `user_id` (PK), `full_name`, `email` (Unique), `phone`, `password_hash`, `role` (`user`, `admin`), `status`, `created_at`, `updated_at`.
2. `categories`: `category_id` (PK), `category_name` (Unique), `description`, `image_url`, `created_at`.
3. `products`: `product_id` (PK), `category_id` (FK), `product_name`, `description`, `price` (DECIMAL 10,2), `original_price`, `image_url`, `stock_quantity`, `is_featured`, `is_published`, `created_at`.
4. `product_variants`: `variant_id` (PK), `product_id` (FK), `size`, `color`, `SKU` (Unique), `stock_quantity`, `created_at`.
5. `product_images`: `image_id` (PK), `product_id` (FK), `image_url`, `alt_text`, `is_primary`, `display_order`, `created_at`.
6. `cart_items`: `cart_item_id` (PK), `user_id` (FK), `product_id` (FK), `variant_id` (FK), `quantity`, `created_at`.
7. `wishlists`: `wishlist_id` (PK), `user_id` (FK), `product_id` (FK), `created_at`.
8. `orders`: `order_id` (PK), `order_number` (Unique), `user_id` (FK), `subtotal`, `delivery_charge`, `discount_amount`, `total_amount`, `payment_method` (`COD`), `payment_status`, `order_status` (`Pending`, `Confirmed`, `Processing`, `Shipped`, `Delivered`, `Cancelled`), `shipping_name`, `shipping_phone`, `shipping_address`, `shipping_city`, `shipping_state`, `shipping_pin_code`, `created_at`.
9. `order_items`: `order_item_id` (PK), `order_id` (FK), `product_id` (FK), `variant_id` (FK), `product_name_snapshot`, `variant_snapshot`, `unit_price`, `quantity`, `subtotal`.
10. `reviews`: `review_id` (PK), `user_id` (FK), `product_id` (FK), `rating` (1-5), `review_text`, `created_at`.
11. `password_reset_tokens`: `reset_id` (PK), `user_id` (FK), `token_hash`, `expires_at`, `used_at`, `created_at`.

---

## 4. Default Football Categories (11 Divisions)

1. Classic Football Jerseys
2. Retro Football Jerseys
3. Modern Football Jerseys
4. Football Boots
5. Football Socks
6. Grip Socks
7. Shin Guards
8. Grip Pads
9. Goalkeeper Gloves
10. Training Equipment
11. Football Accessories

---

## 5. Indian Rupee (INR) Pricing Structure

All prices are managed as `DECIMAL(10,2)` in MySQL and formatted consistently using JavaScript `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`.

- **Training Football Jerseys**: ₹399–₹699
- **Classic Football Jerseys**: ₹499–₹999
- **Retro Football Kits**: ₹699–₹1,299
- **Football Boots**: ₹799–₹1,999
- **Football Socks**: ₹99–₹199
- **Anti-Slip Grip Socks**: ₹199–₹399
- **Shin Guards**: ₹149–₹399
- **Grip Pads**: ₹149–₹299
- **Goalkeeper Gloves**: ₹399–₹999
- **Training Equipment**: ₹199–₹799
- **Football Accessories**: ₹99–₹499
- **Free Delivery**: Automatically applies on orders of ₹999 or higher (standard delivery charge ₹79).

---

## 6. Windows Setup & Running Instructions

### Step 1: Prerequisites
Ensure you have the following installed on Windows:
- **Node.js**: v18+ or v20+ / v24+ (`node -v` in PowerShell)
- **MySQL Server** (Standalone MySQL or XAMPP / WampServer on port 3306)

### Step 2: Start MySQL Service
If using XAMPP:
- Open XAMPP Control Panel and click **Start** next to MySQL, OR run:
```powershell
Start-Process "C:\xampp\mysql\bin\mysqld.exe" -ArgumentList "--defaults-file=C:\xampp\mysql\bin\my.ini","--standalone" -WindowStyle Hidden
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env` in the project root and in `server/.env`:
```powershell
Copy-Item ".env.example" ".env"
Copy-Item ".env.example" "server\.env"
```

Verify your MySQL credentials inside `.env`:
```ini
PORT=5000
NODE_ENV=development

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=retro_store_db

JWT_SECRET=retro_store_super_secure_vintage_football_jwt_key_2026_xyz
JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173
```

### Step 4: Install Dependencies
Open a PowerShell terminal in the project directory `retro/`:
```powershell
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ..\client
npm install
cd ..
```

### Step 5: Initialize MySQL Database (Schema & Seeds)
Run the automated database setup script from the root:
```powershell
node server/scripts/init-db.js
```
*Output: Creates database `retro_store_db`, runs `schema.sql`, and populates `seed.sql` with 11 categories, 26 authentic football products, 67 variants, and reviews.*

### Step 6: Create an Administrator Account
Run the secure admin creation script:
```powershell
node scripts/create-admin.js "Store Administrator" "admin@retrostore.in" "Admin@1234" "+91 9876543210"
```

---

## 7. Starting the Application

Open two terminal windows (or run in background):

### Terminal 1: Backend API Server
```powershell
cd server
npm run dev
```
> Server running live on: **http://localhost:5000**  
> Health check: **http://localhost:5000/api/health**

### Terminal 2: React Frontend Client
```powershell
cd client
npm run dev
```
> Vite Client running live on: **http://localhost:5173**

---

## 8. Login Credentials & Demo Accounts

| Portal | URL | Email | Password | Role |
|---|---|---|---|---|
| **Customer Storefront** | [http://localhost:5173/login](http://localhost:5173/login) | `arjun@example.com` | `User@1234` | `user` |
| **Admin Console** | [http://localhost:5173/admin/login](http://localhost:5173/admin/login) | `admin@retrostore.in` | `Admin@1234` | `admin` |

*New customer registration is available at: [http://localhost:5173/register](http://localhost:5173/register)*

---

## 9. Running Automated Integration Tests

A comprehensive end-to-end test suite is included in `scripts/test-workflows.js`.
To run all tests:
```powershell
node scripts/test-workflows.js
```
This tests:
1. API Health & Configuration
2. Customer Registration, Duplicate Email Rejection & Authentication
3. Product Catalog, Name Search & Category Filtering
4. Persistent Cart & Dynamic Delivery Fee Calculation
5. Wishlist Management & Duplicate Prevention
6. Transactional Checkout, Stock Deduction & Order History
7. Security: Role-Based Access Control (Normal users blocked with HTTP 403)
8. Admin Dashboard KPIs, Product Management, Order Status Management, Users & Inventory

---

## 10. Troubleshooting Common Windows Errors

- **MySQL Connection Refused (`ECONNREFUSED 127.0.0.1:3306`)**:
  - Verify MySQL is running on port 3306. Check in PowerShell with `Test-NetConnection -ComputerName 127.0.0.1 -Port 3306`.
  - In XAMPP, click "Start" next to MySQL in the control panel.
- **Port 5000 or 5173 already in use**:
  - Check listening processes: `netstat -ano | findstr :5000` or `:5173`.
  - Kill orphaned processes with `taskkill /F /PID <PID>`.
- **Image upload issues**:
  - Ensure the folder `server/uploads/products/` exists (created automatically on server start).
  - Uploaded images are served statically via `http://localhost:5000/uploads/products/<filename>`.

---

&copy; RETRO STORE. The Beautiful Game. Forever.
#   R e t r o - S t o r e - F o o t b a l l  
 