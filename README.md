# ⏱ Time Tracker

A full-featured web application for tracking working hours — built with a clean layered architecture, server-driven timer, and a premium dark UI.

**[🇺🇦 Українська версія нижче](#-time-tracker-1)**

---

## ✨ Features

- **Start / Stop Timer** — one-click time tracking with a live counter
- **Server-Driven Timer** — the timer state lives in the database (`endTime IS NULL`); page reloads, closed tabs, even switching devices won't lose your running timer
- **Single-Timer Guarantee** — enforced at three levels: UI (disabled button) → Zustand store → API (409 Conflict)
- **Task Autocomplete** — previously used task names appear as suggestions (debounced, cached)
- **Project Management** — full CRUD with color picker (12-color palette)
- **Time Entry Editing** — edit task name, project, start/end time in a dialog with autocomplete
- **Grouped View** — toggle between list view and project-grouped view with totals
- **Reports** — aggregated data by day / week / month with a donut chart (SVG, no external chart lib) using actual project colors
- **CSV Export** — download reports as `.csv` via `papaparse`
- **Active Timer Bar** — sticky bar always visible at the top showing the running task
- **Keyboard Shortcut** — press `Space` to start/stop the timer (when not in an input)
- **Toast Notifications** — success / error / info feedback
- **Responsive Design** — mobile-friendly, dark monochrome aesthetic
- **Full Validation** — Zod schemas on every mutation endpoint

---

## 🛠 Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | **Next.js 16** (App Router) | SSR, API Routes, file-based routing |
| UI | **React 19** + **Tailwind CSS 4** | Modern, utility-first styling |
| Components | **shadcn/ui** (Radix UI) | Accessible, headless, customizable |
| State | **Zustand** | Lightweight, no boilerplate |
| Database | **Supabase** (PostgreSQL) | Managed Postgres, free tier, pooling |
| ORM | **Prisma 7** | Type-safe queries, migrations, driver adapters |
| Validation | **Zod** | Runtime schema validation + TS types |
| Date/Time | **date-fns** | Lightweight, tree-shakeable |
| CSV | **papaparse** | Reliable CSV generation |
| Language | **TypeScript 5** | End-to-end type safety |
| Deploy | **Vercel** | Native Next.js support |

---

## 📁 Project Structure

```
time_tracker/
├── prisma/
│   ├── schema.prisma            # DB schema (3 models: Project, TaskName, TimeEntry)
│   └── seed.ts                  # Seed data for development
│
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── layout.tsx           # Root layout (dark theme, Inter font)
│   │   ├── page.tsx             # Home — Tracker page
│   │   ├── projects/page.tsx    # Project management page
│   │   ├── reports/page.tsx     # Reports page
│   │   └── api/                 # REST API Routes
│   │       ├── projects/        # GET, POST, PUT, DELETE
│   │       ├── time-entries/    # GET, POST, PUT, DELETE + /active, /[id]/stop
│   │       ├── tasks/           # GET (search), POST, DELETE
│   │       └── reports/         # GET (aggregated) + /export (CSV)
│   │
│   ├── components/              # Presentation Layer
│   │   ├── ui/                  # Base UI (shadcn/ui): Button, Dialog, Input, etc.
│   │   ├── layout/              # AppShell, Header, ActiveTimerBar, ToastContainer
│   │   ├── tracker/             # TimerControls, TaskInput, ProjectSelect, entries
│   │   ├── projects/            # ProjectList, ProjectCard, ProjectForm
│   │   └── reports/             # ReportFilters, ReportTable, ReportChart, CSV button
│   │
│   ├── hooks/                   # React hooks (state + side effects)
│   │   ├── use-timer.ts         # Timer lifecycle (restore, start, stop, tick)
│   │   ├── use-time-entries.ts  # Entries CRUD + optimistic updates
│   │   ├── use-projects.ts      # Projects CRUD
│   │   ├── use-task-suggestions.ts  # Debounced search with cache
│   │   └── use-reports.ts       # Report loading + CSV export
│   │
│   ├── store/                   # Zustand stores
│   │   ├── timer-store.ts       # Active timer state (server-driven)
│   │   └── app-store.ts         # Selected date, toasts
│   │
│   ├── services/                # API Client layer (browser-side fetch wrappers)
│   │   ├── api-client.ts        # Base HTTP client (GET/POST/PUT/DELETE)
│   │   ├── time-entry-service.ts
│   │   ├── project-service.ts
│   │   ├── task-service.ts
│   │   ├── report-service.ts
│   │   └── csv-export-service.ts
│   │
│   ├── repositories/            # Data Access Layer (server-side Prisma)
│   │   ├── project-repository.ts
│   │   ├── task-repository.ts   # Includes upsert-based findOrCreate
│   │   └── time-entry-repository.ts  # Single-timer guard, auto-duration
│   │
│   ├── lib/                     # Utilities
│   │   ├── prisma.ts            # PrismaClient singleton (pg driver adapter)
│   │   ├── validators.ts        # Zod schemas + inferred types
│   │   ├── utils.ts             # cn(), formatDuration, helpers
│   │   └── constants.ts         # Colors, limits, formats
│   │
│   └── types/                   # Shared TypeScript interfaces
│       ├── project.ts
│       ├── task-name.ts
│       ├── time-entry.ts
│       └── report.ts
│
├── .env.example                 # Environment variable template
├── PLAN.md                      # Detailed implementation plan
└── package.json
```

---

## 🏗 Architecture

### Layered Architecture

```
┌───────────────────────────────────────────┐
│             UI Components                 │  React, Tailwind, shadcn/ui
├───────────────────────────────────────────┤
│           Hooks + Zustand Stores          │  useTimer, useTimeEntries, ...
├───────────────────────────────────────────┤
│             Service Layer                 │  API Client (fetch wrappers)
├───────────────────────────────────────────┤
│        Next.js API Routes (REST)          │  Zod validation, error handling
├───────────────────────────────────────────┤
│          Repository Layer                 │  Prisma queries, business rules
├───────────────────────────────────────────┤
│     Supabase PostgreSQL (via Prisma)      │  Managed DB, connection pooling
└───────────────────────────────────────────┘
```

### Key Architectural Decisions

| Decision | Rationale |
|---|---|
| **Server-driven timer** | The source of truth is a `TimeEntry` row with `endTime = NULL`. The client always computes `elapsed = now − startTime` — no drift, survives reloads. |
| **3-level single-timer guard** | UI disables button → store checks `isRunning` → API returns `409` if an active entry exists. |
| **Repository Pattern** | All Prisma calls are isolated in `repositories/`. Easy to test, swap, or extend. |
| **Zustand over Redux** | Minimal boilerplate, works outside React tree, simple API. |
| **TaskName as a separate table** | Normalized data. `findOrCreate` (Prisma `upsert`) prevents duplicates. Enables autocomplete via `ILIKE` search. |
| **Typed errors** | `ActiveTimerError` and `LinkedEntriesError` classes with data fields instead of fragile string matching. |
| **shadcn/ui** | Components are copied into the project (not a black-box dependency). Full customization with Tailwind. |

---

## 🚀 Getting Started (Local Development)

### Prerequisites

- **Node.js** ≥ 18
- **npm** (comes with Node.js)
- A **Supabase** account (free tier) — [supabase.com](https://supabase.com)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/time-tracker.git
cd time-tracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Go to [supabase.com](https://supabase.com) → create a new project
2. Navigate to **Settings → Database → Connection string**
3. Copy the **pooled** connection string (port `6543`)
4. Use it for **both** `DATABASE_URL` (with `?pgbouncer=true`) and `DIRECT_URL` (without the param)

### 4. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
```

> ⚠️ **Important:** Use port **6543** (Supavisor pooler) for **both** URLs. The direct port `5432` often hangs on Supabase free tier and is not needed for this project.

### 5. Push the database schema

```bash
npm run db:push
```

### 6. (Optional) Seed the database

Populates the database with 4 sample projects and ~20 time entries:

```bash
npm run db:seed
```

### 7. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Useful commands

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:push` | Push Prisma schema to DB |
| `npm run db:seed` | Seed DB with sample data |
| `npm run db:studio` | Open Prisma Studio (DB GUI) |
| `npm run lint` | Run ESLint |

---

## 📄 API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/projects` | List all projects |
| `POST` | `/api/projects` | Create a project |
| `PUT` | `/api/projects/[id]` | Update a project |
| `DELETE` | `/api/projects/[id]` | Delete a project (409 if has entries) |
| `GET` | `/api/time-entries?date=YYYY-MM-DD` | List entries by date |
| `GET` | `/api/time-entries/active` | Get running timer (or null) |
| `POST` | `/api/time-entries` | Start a timer (409 if one is running) |
| `PUT` | `/api/time-entries/[id]` | Update an entry |
| `PUT` | `/api/time-entries/[id]/stop` | Stop a running timer |
| `DELETE` | `/api/time-entries/[id]` | Delete an entry |
| `GET` | `/api/tasks?q=...` | Search task names (autocomplete) |
| `POST` | `/api/tasks` | Create a task name |
| `DELETE` | `/api/tasks/[id]` | Delete a task name (409 if linked) |
| `GET` | `/api/reports?from=...&to=...` | Aggregated report |
| `GET` | `/api/reports/export?from=...&to=...&format=csv` | CSV export |

---

---

# ⏱ Time Tracker

Повноцінний веб-додаток для обліку робочого часу — побудований з чистою шаруватою архітектурою, серверним таймером та преміальним темним UI.

---

## ✨ Функціонал

- **Старт / Стоп таймера** — трекінг часу одним кліком з живим лічильником
- **Серверний таймер** — стан таймера зберігається в БД (`endTime IS NULL`); перезавантаження сторінки, закриті вкладки, навіть зміна пристрою не зіб'ють запущений таймер
- **Гарантія єдиного таймера** — забезпечується на трьох рівнях: UI (заблокована кнопка) → Zustand store → API (409 Conflict)
- **Автодоповнення задач** — раніше використані назви задач з'являються як підказки (з debounce та кешем)
- **Управління проєктами** — повний CRUD з вибором кольору (палітра з 12 кольорів)
- **Редагування записів** — зміна назви задачі, проєкту, часу у діалоговому вікні з автодоповненням
- **Групування** — перемикання між списком та групуванням по проєктах із підрахунком часу
- **Звіти** — агреговані дані за день / тиждень / місяць з кільцевою діаграмою (SVG) в кольорах проєктів
- **Експорт CSV** — завантаження звітів як `.csv` через `papaparse`
- **Панель активного таймера** — sticky-панель вгорі з поточним завданням
- **Клавіатурні скорочення** — `Space` для старту/стопу таймера (поза полями вводу)
- **Toast-повідомлення** — зворотний зв'язок: success / error / info
- **Адаптивний дизайн** — mobile-friendly, темна монохромна естетика
- **Повна валідація** — Zod-схеми на кожному mutation-ендпоінті

---

## 🛠 Технологічний стек

| Шар | Технологія | Обґрунтування |
|---|---|---|
| Фреймворк | **Next.js 16** (App Router) | SSR, API Routes, файлова маршрутизація |
| UI | **React 19** + **Tailwind CSS 4** | Сучасний, utility-first стилізація |
| Компоненти | **shadcn/ui** (Radix UI) | Accessible, headless, кастомізуємі |
| State | **Zustand** | Легковагий, без boilerplate |
| База даних | **Supabase** (PostgreSQL) | Managed Postgres, безкоштовний tier, пулінг |
| ORM | **Prisma 7** | Type-safe запити, міграції, driver adapters |
| Валідація | **Zod** | Runtime-валідація + TypeScript типи |
| Дата/час | **date-fns** | Легковагий, tree-shakeable |
| CSV | **papaparse** | Надійна генерація CSV |
| Мова | **TypeScript 5** | Наскрізна типобезпека |
| Деплой | **Vercel** | Нативна підтримка Next.js |

---

## 📁 Структура проєкту

```
time_tracker/
├── prisma/
│   ├── schema.prisma            # Схема БД (3 моделі: Project, TaskName, TimeEntry)
│   └── seed.ts                  # Seed-дані для розробки
│
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── layout.tsx           # Кореневий layout (dark theme, Inter)
│   │   ├── page.tsx             # Головна — сторінка трекера
│   │   ├── projects/page.tsx    # Управління проєктами
│   │   ├── reports/page.tsx     # Сторінка звітів
│   │   └── api/                 # REST API Routes
│   │       ├── projects/        # GET, POST, PUT, DELETE
│   │       ├── time-entries/    # GET, POST, PUT, DELETE + /active, /[id]/stop
│   │       ├── tasks/           # GET (пошук), POST, DELETE
│   │       └── reports/         # GET (агрегація) + /export (CSV)
│   │
│   ├── components/              # Презентаційний шар
│   │   ├── ui/                  # Базові UI (shadcn/ui): Button, Dialog, Input тощо
│   │   ├── layout/              # AppShell, Header, ActiveTimerBar, ToastContainer
│   │   ├── tracker/             # TimerControls, TaskInput, ProjectSelect, записи
│   │   ├── projects/            # ProjectList, ProjectCard, ProjectForm
│   │   └── reports/             # ReportFilters, ReportTable, ReportChart, CSV кнопка
│   │
│   ├── hooks/                   # React хуки (стан + побічні ефекти)
│   │   ├── use-timer.ts         # Життєвий цикл таймера (restore, start, stop, tick)
│   │   ├── use-time-entries.ts  # CRUD записів + оптимістичні оновлення
│   │   ├── use-projects.ts      # CRUD проєктів
│   │   ├── use-task-suggestions.ts  # Debounced пошук з кешем
│   │   └── use-reports.ts       # Завантаження звітів + CSV експорт
│   │
│   ├── store/                   # Zustand стори
│   │   ├── timer-store.ts       # Стан активного таймера (серверний)
│   │   └── app-store.ts         # Обрана дата, toast-повідомлення
│   │
│   ├── services/                # API Client шар (fetch-обгортки для браузера)
│   │   ├── api-client.ts        # Базовий HTTP клієнт (GET/POST/PUT/DELETE)
│   │   ├── time-entry-service.ts
│   │   ├── project-service.ts
│   │   ├── task-service.ts
│   │   ├── report-service.ts
│   │   └── csv-export-service.ts
│   │
│   ├── repositories/            # Data Access Layer (серверний Prisma)
│   │   ├── project-repository.ts
│   │   ├── task-repository.ts   # Включає upsert-based findOrCreate
│   │   └── time-entry-repository.ts  # Захист єдиного таймера, авто-duration
│   │
│   ├── lib/                     # Утиліти
│   │   ├── prisma.ts            # PrismaClient singleton (pg driver adapter)
│   │   ├── validators.ts        # Zod-схеми + inferred типи
│   │   ├── utils.ts             # cn(), formatDuration, хелпери
│   │   └── constants.ts         # Кольори, ліміти, формати
│   │
│   └── types/                   # Спільні TypeScript інтерфейси
│       ├── project.ts
│       ├── task-name.ts
│       ├── time-entry.ts
│       └── report.ts
│
├── .env.example                 # Шаблон змінних оточення
├── PLAN.md                      # Детальний план реалізації
└── package.json
```

---

## 🏗 Архітектура

### Шарувата архітектура

```
┌───────────────────────────────────────────┐
│             UI Компоненти                 │  React, Tailwind, shadcn/ui
├───────────────────────────────────────────┤
│         Хуки + Zustand Стори              │  useTimer, useTimeEntries, ...
├───────────────────────────────────────────┤
│             Сервісний шар                 │  API Client (fetch-обгортки)
├───────────────────────────────────────────┤
│       Next.js API Routes (REST)           │  Zod-валідація, обробка помилок
├───────────────────────────────────────────┤
│            Шар репозиторіїв               │  Prisma-запити, бізнес-правила
├───────────────────────────────────────────┤
│    Supabase PostgreSQL (через Prisma)     │  Managed БД, connection pooling
└───────────────────────────────────────────┘
```

### Ключові архітектурні рішення

| Рішення | Обґрунтування |
|---|---|
| **Серверний таймер** | Джерело правди — рядок `TimeEntry` з `endTime = NULL`. Клієнт завжди обчислює `elapsed = now − startTime` — без дрифту, витримує перезавантаження. |
| **3-рівневий захист єдиного таймера** | UI блокує кнопку → store перевіряє `isRunning` → API повертає `409` якщо активний запис існує. |
| **Repository Pattern** | Усі Prisma-виклики ізольовані в `repositories/`. Легко тестувати, замінювати, розширювати. |
| **Zustand замість Redux** | Мінімальний boilerplate, працює поза React tree, простий API. |
| **TaskName як окрема таблиця** | Нормалізовані дані. `findOrCreate` (Prisma `upsert`) запобігає дублікатам. Забезпечує автодоповнення через `ILIKE` пошук. |
| **Типізовані помилки** | Класи `ActiveTimerError` та `LinkedEntriesError` з полями даних замість крихкого порівняння рядків. |
| **shadcn/ui** | Компоненти копіюються в проєкт (не чорна коробка). Повна кастомізація через Tailwind. |

---

## 🚀 Запуск локально

### Передумови

- **Node.js** ≥ 18
- **npm** (йде разом з Node.js)
- Акаунт на **Supabase** (безкоштовний tier) — [supabase.com](https://supabase.com)

### 1. Клонуйте репозиторій

```bash
git clone https://github.com/your-username/time-tracker.git
cd time-tracker
```

### 2. Встановіть залежності

```bash
npm install
```

### 3. Налаштуйте Supabase

1. Зайдіть на [supabase.com](https://supabase.com) → створіть новий проєкт
2. Перейдіть у **Settings → Database → Connection string**
3. Скопіюйте **pooled** connection string (порт `6543`)
4. Використайте його для **обох** `DATABASE_URL` (з `?pgbouncer=true`) та `DIRECT_URL` (без цього параметра)

### 4. Налаштуйте змінні оточення

```bash
cp .env.example .env
```

Відредагуйте `.env` з вашими Supabase credentials:

```env
DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
```

> ⚠️ **Важливо:** Використовуйте порт **6543** (Supavisor pooler) для **обох** URL. Прямий порт `5432` часто зависає на безкоштовному tier Supabase і для цього проєкту не потрібен.

### 5. Застосуйте схему бази даних

```bash
npm run db:push
```

### 6. (Опціонально) Наповніть БД тестовими даними

Створює 4 проєкти та ~20 записів часу:

```bash
npm run db:seed
```

### 7. Запустіть сервер розробки

```bash
npm run dev
```

Відкрийте [http://localhost:3000](http://localhost:3000) у браузері.

### Корисні команди

| Команда | Опис |
|---|---|
| `npm run dev` | Запуск dev-сервера |
| `npm run build` | Production збірка |
| `npm run start` | Запуск production сервера |
| `npm run db:push` | Застосувати Prisma-схему до БД |
| `npm run db:seed` | Наповнити БД тестовими даними |
| `npm run db:studio` | Відкрити Prisma Studio (GUI для БД) |
| `npm run lint` | Запуск ESLint |

---

## 📄 API Ендпоінти

| Метод | Шлях | Опис |
|---|---|---|
| `GET` | `/api/projects` | Список усіх проєктів |
| `POST` | `/api/projects` | Створити проєкт |
| `PUT` | `/api/projects/[id]` | Оновити проєкт |
| `DELETE` | `/api/projects/[id]` | Видалити проєкт (409 якщо має записи) |
| `GET` | `/api/time-entries?date=YYYY-MM-DD` | Записи за дату |
| `GET` | `/api/time-entries/active` | Активний таймер (або null) |
| `POST` | `/api/time-entries` | Запустити таймер (409 якщо вже є) |
| `PUT` | `/api/time-entries/[id]` | Оновити запис |
| `PUT` | `/api/time-entries/[id]/stop` | Зупинити таймер |
| `DELETE` | `/api/time-entries/[id]` | Видалити запис |
| `GET` | `/api/tasks?q=...` | Пошук назв задач (автодоповнення) |
| `POST` | `/api/tasks` | Створити назву задачі |
| `DELETE` | `/api/tasks/[id]` | Видалити назву задачі (409 якщо зв'язана) |
| `GET` | `/api/reports?from=...&to=...` | Агрегований звіт |
| `GET` | `/api/reports/export?from=...&to=...&format=csv` | CSV експорт |
