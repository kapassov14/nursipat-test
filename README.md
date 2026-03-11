# Психологический профайлинг

Веб-сайт тестирования на определение психотипа и архетипа (Next.js 14, TypeScript, Tailwind, shadcn/ui, Prisma, PostgreSQL).

## Запуск

1. **Поднять PostgreSQL:**

```bash
docker-compose up -d
```

2. **Создать `.env`** (скопировать из примера и при необходимости изменить):

```bash
cp .env.example .env
```

Проверьте переменные:
- `DATABASE_URL` — строка подключения к БД (по умолчанию из docker-compose)
- `ADMIN_EMAIL` и `ADMIN_PASSWORD` — логин и пароль админ-панели

3. **Миграции и генерация Prisma Client:**

```bash
npx prisma migrate dev --name init
```

4. **Запуск приложения:**

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## Структура

- **/** — форма перед тестом (имя, возраст, телефон), кнопка «Начать тест»
- **/test/[sessionId]** — 160 вопросов с тремя вариантами ответа, прогресс-бар, автосохранение
- **/results/[sessionId]** — результаты (ТОП-3 психотипа, основной архетип), PDF, WhatsApp
- **/admin** — вход по логину/паролю, таблица сессий, фильтры, экспорт CSV, детальный просмотр

## Технологии

- Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui (Radix)
- Prisma + PostgreSQL
- Zod, react-hook-form, Zustand
- jspdf + jspdf-autotable для PDF
# profiling-test
# nursipat-test
# nursipat-test
# nursipat-test
# nursipat-test
# nursipat-test
# nursipat-test
# nursipat-test
