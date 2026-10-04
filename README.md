# Teams24

A full-stack e-commerce store: a customer storefront (browse, cart, checkout, orders, wishlist, reviews) and an admin panel (dashboard, products, categories, orders, users, reviews), backed by a REST API with role-based access control.

## Tech stack

| Layer      | Technology                                                                 |
| ---------- | -------------------------------------------------------------------------- |
| Frontend   | React 19, React Router 7, Tailwind CSS 4, Vite 8, lucide-react icons       |
| Backend    | Node.js, Express 5, Zod 4 (validation), JWT + bcryptjs (auth), Multer      |
| Database   | PostgreSQL (Supabase) with Prisma ORM 7 and the `@prisma/adapter-pg` driver |
| Storage    | Supabase Storage for product and category images                          |
| Dev tools  | Nodemon, Concurrently                                                      |

## Prerequisites

- **Node.js 22** (20.19+ also works)
- A **PostgreSQL** database, e.g. a free [Supabase](https://supabase.com) project
- A public Supabase Storage bucket for images (default name `product-images`)

## Getting started

### 1. Install dependencies

```bash
npm install
```

This also runs `prisma generate` to build the Prisma client.

### 2. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable              | Description                                                                 |
| --------------------- | --------------------------------------------------------------------------- |
| `DATABASE_URL`        | PostgreSQL connection string (Supabase → Project Settings → Database)       |
| `PORT`                | API port (default `5000`)                                                   |
| `NODE_ENV`            | `development` or `production`                                               |
| `CLIENT_URL`          | Frontend URL allowed by CORS (default `http://localhost:5173`)              |
| `JWT_SECRET`          | Long random string used to sign login tokens                                |
| `JWT_EXPIRES_IN`      | Token lifetime, e.g. `7d`                                                   |
| `FREE_SHIPPING_ABOVE` | Order subtotal above which shipping is free (default `500`)                 |
| `SHIPPING_FLAT_RATE`  | Shipping charge below that amount (default `50`)                            |
| `ADMIN_NAME`          | Name of the admin account created by the seed                               |
| `ADMIN_EMAIL`         | Admin login email                                                           |
| `ADMIN_PASSWORD`      | Admin login password                                                        |
| `SUPABASE_URL`        | `https://<project-ref>.supabase.co`                                         |
| `SUPABASE_KEY`        | Supabase **secret / service-role** key (server only, never expose it)       |
| `SUPABASE_BUCKET`     | Storage bucket name (default `product-images`)                              |

`DATABASE_URL` and `JWT_SECRET` are required; the server will not start without them. The Supabase variables are only needed for image uploads.

### 3. Set up the database

```bash
npm run db:deploy   # apply migrations
npm run db:seed     # create the admin account and load sample products
```

### 4. Run the app

```bash
npm run dev
```

This starts both servers:

- Storefront: <http://localhost:5173>
- Admin panel: <http://localhost:5173/admin/login> (log in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`)
- API: <http://localhost:5000/api> (health check: `/api/health`)

Vite proxies `/api` requests to the backend, so the frontend and API work together in development.

## Running with Docker

The Docker setup builds the React app and serves it from the Express server, so everything runs on one port.

1. Create `.env` as described above.
2. **Supabase users:** use the **Session pooler** connection string for `DATABASE_URL` (Supabase → **Connect** → *Session pooler*). It looks like:

   ```
   postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres
   ```

   The default *Direct connection* host (`db.<project-ref>.supabase.co`) is IPv6-only, and Docker Desktop cannot reach IPv6 addresses, so the container fails with `P1001: Can't reach database server`.

   If your password contains special characters such as `@`, `:`, `/` or `#`, URL-encode them (for example `@` becomes `%40`), otherwise the connection string may be parsed incorrectly.
3. **Start Docker Desktop** and wait until it shows *Engine running*. If it is not running, every `docker` command fails with:

   ```
   error during connect: ... open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.
   ```

   Tip: enable *Settings → General → Start Docker Desktop when you sign in* so you don't hit this again.
4. Build and start:

   ```bash
   docker compose up --build        # run in the foreground (Ctrl+C to stop)
   docker compose up --build -d     # or run in the background
   ```

   The `migrate` service applies database migrations first and then exits (`No pending migrations to apply.` is normal). The `app` service starts after it finishes successfully. On startup the logs show `API running on http://localhost:5000` and `Database connected`.
5. Open <http://localhost:5000> (storefront) and <http://localhost:5000/admin/login> (admin).

### Checking that it works

```bash
docker compose ps                         # app should show (healthy)
curl http://localhost:5000/api/health     # {"success":true,"status":"ok"}
```

The image includes a health check that calls `/api/health` every 30 seconds.

### Useful commands

```bash
docker compose run --rm migrate npx prisma db seed   # load admin + products.json
docker compose logs -f app                           # follow API logs
docker compose up --build -d                         # rebuild after code changes
docker compose down                                  # stop and remove containers
```

Changes to `.env` take effect after `docker compose up -d` (no rebuild needed). Code changes need `--build`.

| File                 | Purpose                                                                 |
| -------------------- | ----------------------------------------------------------------------- |
| `Dockerfile`         | Multi-stage build: install deps, build frontend, slim production image |
| `docker-compose.yml` | `migrate` (runs migrations) and `app` (API + frontend on port 5000)     |
| `.dockerignore`      | Keeps `node_modules`, `.env`, `.git` and build output out of the image  |

## Scripts

| Command               | What it does                                           |
| --------------------- | ------------------------------------------------------ |
| `npm run dev`         | Run API (nodemon) and frontend (Vite) together         |
| `npm run server`      | Run only the API with auto-reload                      |
| `npm run client`      | Run only the frontend dev server                       |
| `npm run build`       | Build the frontend into `dist/`                        |
| `npm run preview`     | Preview the production build                           |
| `npm start`           | Run the API without auto-reload                        |
| `npm run db:migrate`  | Create and apply a new migration after schema changes  |
| `npm run db:deploy`   | Apply existing migrations (fresh DB or production)     |
| `npm run db:seed`     | Load admin account and catalog data                    |
| `npm run db:studio`   | Open Prisma Studio to browse the database              |
| `npm run db:generate` | Regenerate the Prisma client                           |

## Adding products with `products.json`

Sample catalog data lives in [`backend/prisma/data/products.json`](backend/prisma/data/products.json). The seed script reads this file and inserts it into the database. It is the easiest way to load a fresh database or add many products at once.

### File format

The file is a list of categories, each with its products:

```json
[
  {
    "name": "Electronics",
    "slug": "electronics",
    "description": "Phones, audio and gadgets",
    "imageUrl": "https://.../electronics.jpg",
    "products": [
      {
        "name": "Samsung Galaxy S24 5G (128GB, Onyx Black)",
        "sku": "SAM-S24-128-BLK",
        "brand": "Samsung",
        "price": 74999,
        "discountPrice": 64999,
        "stock": 25,
        "description": "6.2-inch Dynamic AMOLED 2X display...",
        "thumbnailUrl": "https://.../sam-s24-128-blk-1.jpg",
        "images": ["https://.../sam-s24-128-blk-1.jpg", "https://.../sam-s24-128-blk-2.jpg"]
      }
    ]
  }
]
```

**Category fields**

| Field         | Required | Notes                                         |
| ------------- | -------- | --------------------------------------------- |
| `name`        | yes      |                                               |
| `slug`        | no       | Generated from `name` if omitted              |
| `description` | no       |                                               |
| `imageUrl`    | no       | A placeholder image is used if omitted        |
| `products`    | no       | List of products in this category             |

**Product fields**

| Field           | Required | Notes                                                       |
| --------------- | -------- | ----------------------------------------------------------- |
| `name`          | yes      |                                                             |
| `sku`           | yes      | Must be unique; used to detect products that already exist  |
| `price`         | yes      | In rupees                                                   |
| `discountPrice` | no       | Must be lower than `price`                                  |
| `stock`         | no       | Defaults to `0`                                             |
| `brand`         | no       |                                                             |
| `description`   | no       |                                                             |
| `slug`          | no       | Generated from `name` if omitted                            |
| `isActive`      | no       | Defaults to `true`                                          |
| `thumbnailUrl`  | no       | Defaults to the first image                                 |
| `images`        | no       | List of image URLs; placeholders are used if omitted        |

### Adding new data

1. Add a new category object, or add products to an existing category's `products` list.
2. Give every new product a **unique `sku`**.
3. Run:

   ```bash
   npm run db:seed
   ```

The seed is safe to run again. It **only adds what is missing**:

- Categories are matched by `slug`; existing categories are not changed.
- Products are matched by `sku`; existing products are skipped, not updated.
- The admin account is created, or promoted to admin if the email already exists.

To change a product that is already in the database, edit it in the admin panel (or Prisma Studio). Editing it in `products.json` alone will not update it.

### Starting over with a clean database

```bash
npx prisma migrate reset
```

This **deletes all data** (including orders and users), re-applies migrations and runs the seed again.

## Images

Images are stored in **Supabase Storage**, not in the project or the database. The database only stores each image's public URL.

```
product-images/          (Supabase Storage bucket)
├── catalog/             sample product photos used by products.json
├── products/            images uploaded from the admin panel
└── categories/          category images uploaded from the admin panel
```

In the admin panel, use the **Upload** button on the product and category forms. JPG, PNG, WEBP and GIF files up to 5 MB are accepted. Deleting a gallery image or a product also removes its uploaded files from the bucket.

For `products.json`, upload images to the bucket first (Supabase dashboard → Storage), then paste their public URLs into `thumbnailUrl` / `images`. Any public image URL also works.

## Project structure

```
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        database models
│   │   ├── migrations/          SQL migrations
│   │   ├── seed.js              seed script
│   │   └── data/products.json   sample catalog data
│   └── src/
│       ├── server.js            entry point
│       ├── app.js               Express app setup
│       ├── config/              env variables, roles and permissions
│       ├── controllers/         request handlers
│       ├── routes/              API routes
│       ├── middleware/          auth, validation, uploads, errors
│       ├── validations/         Zod schemas
│       ├── lib/                 Prisma client, Supabase storage
│       └── utils/
├── frontend/
│   ├── index.html
│   └── src/
│       ├── App.jsx              routes
│       ├── pages/               admin pages
│       ├── components/          admin components
│       └── store/               storefront (pages, components, context)
├── prisma7.config.ts            Prisma config (schema, migrations, seed)
├── vite.config.mjs              Vite config and /api proxy
└── .env.example
```

## Roles

| Role       | Can do                                                                              |
| ---------- | ----------------------------------------------------------------------------------- |
| `customer` | Manage profile, addresses, cart, wishlist; place and cancel own orders; write reviews |
| `admin`    | Everything a customer can, plus manage products, categories, orders, users, reviews and view the dashboard |

New sign-ups are customers. The admin account comes from the `ADMIN_*` variables when you run the seed.

## API overview

All endpoints are under `/api`. Protected endpoints need an `Authorization: Bearer <token>` header (the token is returned by login/register).

| Area       | Endpoints                                                                                     |
| ---------- | --------------------------------------------------------------------------------------------- |
| Auth       | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `PATCH /auth/me`, `PATCH /auth/me/password` |
| Catalog    | `GET /categories`, `GET /categories/:slug`, `GET /products`, `GET /products/:slug`, `GET /products/:productId/reviews` |
| Cart       | `GET /cart`, `DELETE /cart`, `POST /cart/items`, `PATCH /cart/items/:productId`, `DELETE /cart/items/:productId` |
| Wishlist   | `GET /wishlist`, `POST /wishlist/items`, `DELETE /wishlist/items/:productId`, `POST /wishlist/items/:productId/move-to-cart` |
| Addresses  | `GET/POST /addresses`, `GET/PATCH/DELETE /addresses/:id`                                       |
| Orders     | `POST /orders` (checkout), `GET /orders`, `GET /orders/:id`, `POST /orders/:id/cancel`         |
| Reviews    | `POST /reviews`, `PATCH /reviews/:id`, `DELETE /reviews/:id`                                   |
| Admin      | `/admin/dashboard`, `/admin/products`, `/admin/categories`, `/admin/orders`, `/admin/users`, `/admin/reviews`, `POST /admin/uploads` |

Product listing supports `search`, `category`, `brand`, `minPrice`, `maxPrice`, `inStock`, `sort` (`newest`, `price_asc`, `price_desc`, `name_asc`, ...), `page` and `limit` query parameters.

## Notes

- Payments are recorded with the chosen method (card, UPI, cash on delivery, ...) but no payment gateway is connected yet.
- "Continue with Google / GitHub" buttons on the login page are placeholders.
