# Quamtium Sportbox — App de Gestión de Turnos

PWA fullstack para gestión de clases y reservas del gimnasio Quamtium Sportbox.

## Stack

- **Frontend**: React + Vite + Tailwind CSS → PWA instalable
- **Backend**: Node.js + Express
- **Base de datos**: Supabase (PostgreSQL + RLS)
- **Auth**: Google OAuth via Supabase Auth
- **Deploy**: Vercel (frontend) + Render (backend)

---

## Setup paso a paso

### 1. Supabase

1. Crear proyecto nuevo en [supabase.com](https://supabase.com)
2. Ir a **SQL Editor** y ejecutar el archivo `supabase/schema.sql`
3. En **Authentication → Providers**, habilitar **Google**
4. Configurar las credenciales OAuth de Google Cloud Console
5. Agregar en **Redirect URLs**: `https://tu-frontend.vercel.app/auth/callback`

### 2. Google OAuth

1. Ir a [Google Cloud Console](https://console.cloud.google.com)
2. Crear credenciales OAuth 2.0 (tipo: Web application)
3. Agregar en "Authorized redirect URIs":
   - `https://<tu-proyecto>.supabase.co/auth/v1/callback`
4. Copiar Client ID y Client Secret al provider de Google en Supabase

### 3. Backend (local)

```bash
cd backend
cp .env.example .env
# Completar .env con tus valores de Supabase
npm install
npm run dev
```

### 4. Frontend (local)

```bash
cd frontend
cp .env.example .env
# Completar .env con tus valores
npm install
npm run dev
```

---

## Variables de entorno

### Backend `.env`

| Variable | Descripción |
|----------|-------------|
| `PORT` | Puerto del servidor (default: 3001) |
| `FRONTEND_URL` | URL del frontend para CORS |
| `SUPABASE_URL` | URL de tu proyecto Supabase |
| `SUPABASE_ANON_KEY` | Anon key de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (para bypass de RLS en el backend) |

### Frontend `.env`

| Variable | Descripción |
|----------|-------------|
| `VITE_SUPABASE_URL` | URL de tu proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Anon key de Supabase |
| `VITE_API_URL` | URL del backend |

---

## Deploy

### Vercel (frontend)

1. Importar repo en Vercel
2. Root directory: `frontend`
3. Build command: `npm run build`
4. Output: `dist`
5. Agregar variables de entorno

### Render (backend)

1. Nuevo Web Service
2. Root directory: `backend`
3. Start command: `node src/index.js`
4. Agregar variables de entorno
5. Agregar la URL pública de Render como `VITE_API_URL` en Vercel

---

## Primer admin

Después del primer login con Google:

```sql
-- Ejecutar en Supabase SQL Editor
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'tu@email.com';
```

---

## Funcionalidades

### Usuario
- ✅ Login con Google (un clic)
- ✅ Ver clases disponibles por semana
- ✅ Reservar turno (con validación de cupos)
- ✅ Cancelar reserva (hasta 1h antes)
- ✅ Dashboard con próximos turnos
- ✅ Historial de reservas
- ✅ Perfil editable

### Admin
- ✅ Panel con métricas generales
- ✅ Crear/editar/cancelar/eliminar clases
- ✅ Ver lista de inscriptos por clase
- ✅ Marcar asistencia
- ✅ Gestionar usuarios y roles

### PWA
- ✅ Instalable en iOS y Android desde el navegador
- ✅ Funciona offline (caché de assets)
- ✅ Soporte de notch/dynamic island (safe areas)
- ✅ Look & feel nativo
