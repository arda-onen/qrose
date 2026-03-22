# QRose - Full Stack QR Menu SaaS

Node.js + Express + PostgreSQL + React (Vite) + TailwindCSS QR menu SaaS platform with:

- Admin and restaurant roles
- JWT authentication
- Multi-language menu item translations
- Five menu themes
- QR code generation
- Hosted public menu pages (`/menu/:slug`)
- **Masa QR + garson çağır:** `/menu/:slug?t=<token>` ile masa başına menü; müşteri “Garson çağır” dediğinde restoran panelinde (SSE + yedek polling) anında listelenir.
- Static export (`index.html`, `style.css`, `script.js`, `menu.json`, `images/`)

## Project Structure

```txt
QRose/
  backend/
    .env.example
    package.json
    uploads/
    generated/
      qrcodes/
      exports/
    src/
      app.js
      server.js
      db/
        pool.js
        schema.sql
        startupSchema.js
        initSchema.js
      middleware/
        auth.js
        errorHandler.js
      routes/
        auth.js
        admin.js
        restaurant.js
        public.js
      utils/
        slug.js
        qr.js
        menuData.js
        exporter.js
  frontend/
    package.json
    index.html
    vite.config.js
    postcss.config.js
    tailwind.config.js
    src/
      main.jsx
      App.jsx
      index.css
      components/
        DashboardLayout.jsx
        ProtectedRoute.jsx
      context/
        AuthContext.jsx
      lib/
        api.js
      pages/
        LoginPage.jsx
        AdminDashboard.jsx
        RestaurantDashboard.jsx
        PublicMenuPage.jsx
      themes/
        ClassicTheme.jsx
        DarkModernTheme.jsx
        MinimalTheme.jsx
        LuxuryTheme.jsx
        StreetFoodTheme.jsx
        index.js
  docker-compose.yml
  package.json
  README.md
```

## Setup

1. Install and run PostgreSQL locally (no Docker)

```bash
createdb -U postgres qrose
```

2. Install dependencies

```bash
npm install --prefix backend
npm install --prefix frontend
```

3. Configure backend env

```bash
# Windows PowerShell
Copy-Item backend/.env.example backend/.env
```

Then edit `backend/.env` and set:

```env
PORT=4000
JWT_SECRET=change_me
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/qrose
PUBLIC_BASE_URL=http://localhost:5173
```

4. Run backend and frontend

```bash
npm run dev:backend
npm run dev:frontend
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:4000`

### If `createdb` is not available

Use `psql`:

```bash
psql -U postgres -c "CREATE DATABASE qrose;"
```

Or use a managed PostgreSQL (Neon/Supabase/Railway) and put its connection string in `DATABASE_URL`.

## API Endpoints

### Auth

- `POST /auth/register`
- `POST /auth/login`

### Admin

- `POST /admin/menus` create menu + restaurant account + QR
- `GET /admin/menus`
- `DELETE /admin/menus/:id`
- `GET /admin/menus/:id/qr` download PNG
- `POST /admin/menus/:id/export` download ZIP static export

### Restaurant

- `GET /restaurant/menu`
- `PUT /restaurant/menu`
- `GET /restaurant/menu/qr`
- `POST /restaurant/categories`
- `PUT /restaurant/categories/:id`
- `DELETE /restaurant/categories/:id`
- `POST /restaurant/items`
- `PUT /restaurant/items/:id`
- `DELETE /restaurant/items/:id`

### Public

- `GET /menu/:slug`

## Notes

- `POST /admin/menus` automatically creates:
  - restaurant user (`role = restaurant`)
  - unique menu slug
  - QR code image under `backend/generated/qrcodes`
- Static export ZIP is generated from DB data and includes copied menu images.
- Theme keys:
  - `classic`
  - `dark_modern`
  - `minimal`
  - `luxury`
  - `street_food`
