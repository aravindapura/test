# Finance Tracker (Node.js + TypeScript)

Простое приложение для учета финансов, написанное на Node.js и TypeScript. Логика вынесена в отдельный класс `FinanceTracker`, а взаимодействие с ним происходит через серверless-функцию `api/transactions.ts`, которую легко запускать локально и деплоить на Vercel. Это делает решение удобной основой для адаптации под Android и iOS — мобильные клиенты могут обращаться к REST API.

## Возможности

- Добавление доходов и расходов с автоматической валидацией.
- Подсчет текущего баланса.
- Агрегация по категориям с учетом типа операции.
- Хранение данных в JSON-файле (локально) с возможностью вынести путь к файлу в переменную окружения `DATA_FILE_PATH`.
- Готовый REST API (GET/POST `/api/transactions`) для интеграции с вебом или мобильными приложениями.

## Быстрый старт

```bash
npm install
npm run dev
```

Скрипт `dev` поднимает локальный серверless-хэндлер через `tsx`. По умолчанию данные сохраняются в `data/finance-data.json`. Чтобы указать свой путь, задайте переменную окружения `DATA_FILE_PATH`.

### Примеры запросов

```bash
# Получить список операций, баланс и сводку по категориям
curl http://localhost:3000/api/transactions

# Добавить расход
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
        "amount": 1500,
        "category": "rent",
        "description": "Аренда квартиры",
        "type": "expense"
      }'
```

> **Важно:** Vercel не гарантирует постоянную запись на диск. Для production-окружений подключите внешнюю базу данных или KV-хранилище и реализуйте другой адаптер в `src/storage.ts`.

## Тестирование

```bash
npm test
```

Тесты написаны на [Vitest](https://vitest.dev) и покрывают базовые сценарии работы `FinanceTracker`.

## Деплой на Vercel

1. Установите [Vercel CLI](https://vercel.com/docs/cli) и выполните `vercel login`.
2. В корне проекта запустите `vercel` и следуйте инструкциям.
3. При необходимости определите переменную окружения `DATA_FILE_PATH` (например, `/tmp/finance-data.json`).

После деплоя API будет доступно по адресу `https://<project-name>.vercel.app/api/transactions`.
