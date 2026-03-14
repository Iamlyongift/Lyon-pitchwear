# Lyon Pitchwear — Backend API Documentation

A RESTful API for Lyon Pitchwear, an elite sports apparel brand. Built with **Express.js**, **TypeScript**, **MongoDB/Mongoose**, **Cloudinary** (image uploads), and **JWT** authentication.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [API Reference](#api-reference)
  - [Auth](#auth-routes)
  - [User](#user-routes)
  - [Products](#product-routes)
  - [Orders](#order-routes)
  - [Reviews](#review-routes)
  - [Admin](#admin-routes)
  - [Dashboard](#dashboard-routes)
- [Data Models](#data-models)
- [Enums & Constants](#enums--constants)
- [Error Handling](#error-handling)
- [Business Logic](#business-logic)

---

## Tech Stack

| Technology           | Purpose              |
| -------------------- | -------------------- |
| Node.js + Express.js | Server framework     |
| TypeScript           | Type safety          |
| MongoDB + Mongoose   | Database + ODM       |
| JWT (jsonwebtoken)   | Authentication       |
| bcryptjs             | Password hashing     |
| Cloudinary           | Image storage        |
| Multer               | File upload handling |
| Joi                  | Request validation   |
| Nodemailer           | Email sending        |
| ts-node-dev          | Development server   |

---

## Project Structure

```
src/
├── configs/
│   ├── DB.ts                    ← MongoDB connection
│   └── cloudinary.config.ts     ← Cloudinary setup + helpers
├── controller/
│   ├── adminController.ts
│   ├── dashboardController.ts
│   ├── orderController.ts
│   ├── productController.ts
│   ├── reviewController.ts
│   └── userController.ts
├── function/
│   └── sendEmail.ts             ← Nodemailer email functions
├── library/
│   └── helpers/
│       ├── adminjwtHelper.ts    ← Admin JWT sign/verify
│       ├── jwtHelper.ts         ← User JWT sign/verify
│       └── requestHelper.ts     ← getParam helper
├── middleware/
│   ├── adminAuth.ts             ← adminProtect, superAdminOnly, requirePermission
│   └── auth.ts                  ← protect (user auth)
├── models/
│   ├── adminModel.ts
│   ├── orderModel.ts
│   ├── productModel.ts
│   ├── reviewModel.ts
│   └── userModel.ts
├── routes/
│   ├── adminRouter.ts
│   ├── orderRouter.ts
│   ├── productRoute.ts
│   ├── reviewRouter.ts
│   └── userRoute.ts
├── service/
│   ├── adminService.ts
│   ├── dashboardService.ts
│   ├── orderService.ts
│   ├── productService.ts
│   ├── reviewService.ts
│   └── userService.ts
├── types/
│   ├── adminType.ts
│   ├── emailType.ts
│   ├── orderType.ts
│   ├── productType.ts
│   ├── reviewType.ts
│   └── userType.ts
├── utils/
│   ├── enums/
│   │   ├── adminEnum.ts
│   │   ├── orderEnum.ts
│   │   ├── productEnum.ts
│   │   ├── reviewEnum.ts
│   │   └── userEnum.ts
│   └── validators/
│       ├── adminValidator.ts
│       ├── orderValidator.ts
│       ├── productValidator.ts
│       ├── reviewValidator.ts
│       └── userValidator.ts
├── app.ts                       ← Express app setup
└── server.ts                    ← Server entry point
```

---

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=4000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/Lyon_Pitchware

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (SMTP)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your_smtp_key

# Client
CLIENT_URL=http://localhost:3000

# Super Admin (auto-seeded on first run)
SUPER_ADMIN_EMAIL=superadmin@lyonpitchwear.com
SUPER_ADMIN_PASSWORD=SuperAdmin@123

# Bank Details (shown to customers on order placement)
BANK_NAME=Your Bank Name
BANK_ACCOUNT_NUMBER=0000000000
BANK_ACCOUNT_NAME=Lyon Pitchwear
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Run in development
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

On first run the server will:

1. Connect to MongoDB
2. Auto-seed a super admin account using `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD` from `.env`
3. Start listening on the configured `PORT`

---

## Authentication

The API uses two separate JWT systems:

### User Token

- Obtained via `POST /api/auth/login`
- Expires in `7d`
- Required for all protected customer routes
- Pass in `Authorization: Bearer <token>` header

### Admin Token

- Obtained via `POST /api/admin/auth/login`
- Expires in `1d`
- Required for all admin routes
- Contains `isAdmin: true` flag — cannot be used on user routes

---

## API Reference

Base URL: `http://localhost:4000`

---

### Auth Routes

**Base:** `/api/auth`

#### Register

```
POST /api/auth/register
```

**Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@gmail.com",
  "password": "Test@1234"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "token": "<jwt_token>",
  "data": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@gmail.com",
    "role": "customer",
    "status": "pending_verification"
  }
}
```

---

#### Login

```
POST /api/auth/login
```

**Body:**

```json
{
  "email": "john@gmail.com",
  "password": "Test@1234"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "token":   "<jwt_token>",
  "data":    { ...user },
  "message": "Login successful"
}
```

---

#### Forgot Password

```
POST /api/auth/forgot-password
```

**Body:**

```json
{ "email": "john@gmail.com" }
```

---

#### Reset Password

```
POST /api/auth/reset-password
```

**Body:**

```json
{
  "token": "<reset_token_from_email>",
  "password": "NewPass@1234"
}
```

---

### User Routes

**Base:** `/api/user` — Requires `Authorization: Bearer <user_token>`

| Method | Endpoint                       | Description                      |
| ------ | ------------------------------ | -------------------------------- |
| GET    | `/api/user/me`                 | Get my profile                   |
| PUT    | `/api/user/me`                 | Update my profile                |
| PATCH  | `/api/user/me/change-password` | Change password                  |
| GET    | `/api/user`                    | Get all users (admin token)      |
| GET    | `/api/user/:id`                | Get user by ID (admin token)     |
| PATCH  | `/api/user/:id/status`         | Toggle user status (admin token) |

#### Update Profile Body

```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "08012345678"
}
```

#### Change Password Body

```json
{
  "currentPassword": "Test@1234",
  "newPassword": "NewPass@1234"
}
```

---

### Product Routes

**Base:** `/api/products` — All public, no token required

| Method | Endpoint                           | Description        |
| ------ | ---------------------------------- | ------------------ |
| GET    | `/api/products`                    | Get all products   |
| GET    | `/api/products/category/:category` | Get by category    |
| GET    | `/api/products/:id`                | Get single product |

#### Query Parameters (GET /api/products)

| Param       | Type    | Example                                  |
| ----------- | ------- | ---------------------------------------- |
| `category`  | string  | `kits`, `gym-gear`, `training-equipment` |
| `featured`  | boolean | `true`                                   |
| `search`    | string  | `home kit`                               |
| `minPrice`  | number  | `10000`                                  |
| `maxPrice`  | number  | `50000`                                  |
| `sortBy`    | string  | `price`, `createdAt`                     |
| `sortOrder` | string  | `asc`, `desc`                            |
| `page`      | number  | `1`                                      |
| `limit`     | number  | `10`                                     |

---

### Order Routes

**Base:** `/api/orders` — Requires `Authorization: Bearer <user_token>`

| Method | Endpoint                           | Description      |
| ------ | ---------------------------------- | ---------------- |
| POST   | `/api/orders`                      | Place an order   |
| GET    | `/api/orders/my-orders`            | Get my orders    |
| GET    | `/api/orders/my-orders/:id`        | Get single order |
| PATCH  | `/api/orders/my-orders/:id/cancel` | Cancel an order  |

#### Place Order Body

```json
{
  "orderItems": [
    {
      "product": "<product_id>",
      "quantity": 2,
      "size": "L",
      "color": "white"
    }
  ],
  "shippingAddress": {
    "fullName": "John Doe",
    "phone": "08012345678",
    "address": "12 Victoria Street",
    "city": "Lagos",
    "state": "Lagos",
    "country": "Nigeria"
  },
  "deliveryMethod": "standard",
  "notes": "Please package carefully"
}
```

#### Delivery Methods & Fees

| Method     | Fee    |
| ---------- | ------ |
| `standard` | ₦2,500 |
| `express`  | ₦5,000 |
| `pickup`   | ₦0     |

#### Order Response includes bank details:

```json
{
  "bankDetails": {
    "bankName": "Your Bank Name",
    "accountNumber": "0000000000",
    "accountName": "Lyon Pitchwear"
  },
  "orderNumber": "LYN-2026-00001",
  "grandTotal": 38500
}
```

---

### Review Routes

**Base:** `/api/reviews`

| Method | Endpoint                          | Auth       | Description         |
| ------ | --------------------------------- | ---------- | ------------------- |
| GET    | `/api/reviews/product/:productId` | None       | Get product reviews |
| POST   | `/api/reviews`                    | User token | Submit a review     |
| GET    | `/api/reviews/my-reviews`         | User token | Get my reviews      |
| PUT    | `/api/reviews/:id`                | User token | Update my review    |
| DELETE | `/api/reviews/:id`                | User token | Delete my review    |

#### Submit Review Body

```json
{
  "product": "<product_id>",
  "order": "<order_id>",
  "rating": 5,
  "title": "Excellent quality kit",
  "body": "The jersey is top quality, great stitching and very comfortable."
}
```

> **Note:** Customer can only review a product from a **delivered** order. One review per product per order.

#### Product Reviews Response includes rating summary:

```json
{
  "reviews": [...],
  "summary": {
    "avgRating": 4.5,
    "total": 10,
    "five":  7,
    "four":  2,
    "three": 1,
    "two":   0,
    "one":   0
  }
}
```

---

### Admin Routes

**Base:** `/api/admin` — Requires `Authorization: Bearer <admin_token>`

#### Admin Auth

```
POST /api/admin/auth/login
Body: { "email": "...", "password": "..." }
```

#### Admin Profile

| Method | Endpoint                        | Description          |
| ------ | ------------------------------- | -------------------- |
| GET    | `/api/admin/me`                 | Get my admin profile |
| PATCH  | `/api/admin/me/change-password` | Change password      |

#### Admin Management (Super Admin only)

| Method | Endpoint                       | Description            |
| ------ | ------------------------------ | ---------------------- |
| POST   | `/api/admin/admins`            | Create new admin       |
| GET    | `/api/admin/admins`            | Get all admins         |
| GET    | `/api/admin/admins/:id`        | Get admin by ID        |
| PUT    | `/api/admin/admins/:id`        | Update admin           |
| PATCH  | `/api/admin/admins/:id/status` | Suspend/activate admin |
| DELETE | `/api/admin/admins/:id`        | Delete admin           |

#### Create Admin Body

```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@lyonpitchwear.com",
  "password": "Admin@1234",
  "role": "admin",
  "permissions": [
    "create_product",
    "update_product",
    "view_products",
    "view_orders"
  ]
}
```

#### Admin Roles

| Role          | Access                      |
| ------------- | --------------------------- |
| `super_admin` | Full access to everything   |
| `admin`       | Access based on permissions |
| `manager`     | Access based on permissions |

#### Admin Permissions

```
create_product    update_product    delete_product    view_products
view_orders       update_order      cancel_order
view_users        suspend_user      delete_user
create_admin      update_admin      delete_admin
```

#### Product Management (Admin)

| Method | Endpoint                            | Description                |
| ------ | ----------------------------------- | -------------------------- |
| GET    | `/api/admin/products`               | Get all products           |
| GET    | `/api/admin/products/category/:cat` | Get by category            |
| GET    | `/api/admin/products/:id`           | Get single product         |
| POST   | `/api/admin/products`               | Create product (form-data) |
| PUT    | `/api/admin/products/:id`           | Update product (form-data) |
| PATCH  | `/api/admin/products/:id/featured`  | Toggle featured            |
| DELETE | `/api/admin/products/:id`           | Delete product             |

#### Create/Update Product (form-data)

| Field                       | Type           | Required         |
| --------------------------- | -------------- | ---------------- |
| `name`                      | Text           | Yes              |
| `description`               | Text           | Yes              |
| `price`                     | Text (number)  | Yes              |
| `category`                  | Text           | Yes              |
| `subCategory`               | Text           | No               |
| `sizes[0]`, `sizes[1]`...   | Text           | No               |
| `colors[0]`, `colors[1]`... | Text           | No               |
| `sku`                       | Text           | Yes (create)     |
| `featured`                  | Text (boolean) | No               |
| `inStock`                   | Text (boolean) | No               |
| `images`                    | File           | No               |
| `existingImages[0]`...      | Text (URL)     | No (update only) |

#### Order Management (Admin)

| Method | Endpoint                        | Description           |
| ------ | ------------------------------- | --------------------- |
| GET    | `/api/admin/orders`             | Get all orders        |
| GET    | `/api/admin/orders/:id`         | Get single order      |
| PATCH  | `/api/admin/orders/:id/status`  | Update order status   |
| PATCH  | `/api/admin/orders/:id/payment` | Update payment status |

#### Update Order Status Body

```json
{ "orderStatus": "processing" }
```

Values: `pending` → `confirmed` → `processing` → `shipped` → `delivered` / `cancelled`

#### Update Payment Status Body

```json
{ "paymentStatus": "payment_confirmed" }
```

Values: `awaiting_payment` → `payment_received` → `payment_confirmed` / `payment_failed` / `refunded`

> **Note:** Setting `paymentStatus` to `payment_confirmed` automatically sets `orderStatus` to `confirmed`.

#### Review Moderation (Admin)

| Method | Endpoint                            | Description           |
| ------ | ----------------------------------- | --------------------- |
| GET    | `/api/admin/reviews`                | Get all reviews       |
| GET    | `/api/admin/reviews?status=pending` | Filter by status      |
| PATCH  | `/api/admin/reviews/:id/moderate`   | Approve/reject review |
| DELETE | `/api/admin/reviews/:id`            | Delete review         |

#### Moderate Review Body

```json
{ "status": "approved" }
```

Values: `pending`, `approved`, `rejected`

---

### Dashboard Routes

```
GET /api/admin/dashboard
Authorization: Bearer <admin_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "overview": {
      "totalRevenue":    38500,
      "totalOrders":     5,
      "totalProducts":   8,
      "totalCustomers":  3,
      "pendingOrders":   2,
      "deliveredOrders": 1
    },
    "revenueByMonth": [
      { "month": "Mar 2026", "revenue": 38500, "orders": 1 }
    ],
    "topProducts": [
      { "name": "Arsenal home kit", "totalSold": 2, "revenue": 36000, "image": "..." }
    ],
    "ordersByStatus": [
      { "status": "pending",   "count": 2 },
      { "status": "delivered", "count": 1 }
    ],
    "recentOrders": [...]
  }
}
```

---

## Data Models

### User

```
_id, firstName, lastName, email, password (hashed),
role, status, provider, isEmailVerified,
phone, address, lastLogin, createdAt, updatedAt
```

### Product

```
_id, name, description, price, category, subCategory,
images[], sizes[], colors[], sku, inStock, featured,
status, rating, ratingCount, createdAt, updatedAt
```

### Order

```
_id, orderNumber, user, orderItems[], shippingAddress,
deliveryMethod, deliveryFee, subTotal, grandTotal,
orderStatus, paymentStatus, bankDetails,
notes, confirmedAt, shippedAt, deliveredAt,
cancelledAt, cancellationReason, createdAt, updatedAt
```

### Review

```
_id, user, product, order, rating, title, body,
status, createdAt, updatedAt
```

### Admin

```
_id, firstName, lastName, email, password (hashed),
role, status, permissions[], lastLogin,
createdBy, createdAt, updatedAt
```

---

## Enums & Constants

### User

```
UserRole:    customer
UserStatus:  active, inactive, pending_verification, suspended
AuthProvider: local, google
```

### Product

```
ProductCategory: kits, gym-gear, training-equipment
ProductStatus:   active, inactive, out-of-stock
```

### Order

```
OrderStatus:   pending, confirmed, processing, shipped, delivered, cancelled
PaymentStatus: awaiting_payment, payment_received, payment_confirmed, payment_failed, refunded
DeliveryMethod: standard (₦2,500), express (₦5,000), pickup (free)
```

### Review

```
ReviewStatus: pending, approved, rejected
```

### Admin

```
AdminRole:   super_admin, admin, manager
AdminStatus: active, inactive, suspended
```

---

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description here"
}
```

Validation errors return an array:

```json
{
  "success": false,
  "message": [
    "\"email\" is required",
    "\"password\" must be at least 8 characters"
  ]
}
```

### HTTP Status Codes

| Code | Meaning                              |
| ---- | ------------------------------------ |
| 200  | OK                                   |
| 201  | Created                              |
| 400  | Bad Request (validation error)       |
| 401  | Unauthorized (missing/invalid token) |
| 403  | Forbidden (insufficient permissions) |
| 404  | Not Found                            |
| 500  | Internal Server Error                |

---

## Business Logic

### Order Number Generation

Orders are auto-numbered sequentially:

```
LYN-{year}-{5-digit-sequence}
e.g. LYN-2026-00001, LYN-2026-00002
```

### Product Rating Calculation

Product `rating` and `ratingCount` auto-update after every review save/delete.
Only **approved** reviews count towards the rating.

### Image Management

- Images upload directly to Cloudinary under `lyon-pitchwear/products/`
- On product delete → all images deleted from Cloudinary automatically
- On product update → pass `existingImages[]` URLs to keep, new files to add. Images not in `existingImages` are deleted from Cloudinary.

### Bank Transfer Flow

```
Customer places order → bank details shown in response
Customer transfers money manually
Admin confirms via PATCH /api/admin/orders/:id/payment
{ "paymentStatus": "payment_confirmed" }
Order automatically moves to "confirmed"
```

### Review Eligibility

A customer can only review a product if:

1. They ordered it
2. The order has been delivered
3. They haven't already reviewed that product from that order

---

## Installed Packages

```bash
npm install express mongoose bcryptjs jsonwebtoken joi nodemailer
           multer cloudinary multer-storage-cloudinary http-errors
           cookie-parser morgan dotenv

npm install -D typescript ts-node-dev @types/express @types/node
            @types/bcryptjs @types/jsonwebtoken @types/nodemailer
            @types/multer @types/cookie-parser @types/morgan
            @types/http-errors
```

---

_Built for Lyon Pitchwear — Elite Sports Apparel_
