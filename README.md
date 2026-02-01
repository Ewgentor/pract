# Система управления студентами и стипендией

Веб-приложение для управления данными студентов, отслеживания портфолио, отчетов и расчета стипендии на основе взвешивающих коэффициентов.

## Технологический стек

- **Backend**: Node.js + Express.js
- **Templating**: Express Handlebars
- **Database**: MongoDB + Mongoose
- **Frontend**: HTML, CSS, JavaScript

## Установка зависимостей

```bash
npm install
```

## Запуск проекта

### Для разработки (с перезагрузкой при изменениях):

```bash
npm run dev
```

### Для production:

```bash
npm start
```

Приложение будет доступно на `http://localhost:3000`

## Структура проекта

- `server.js` - основной файл сервера
- `models.js` - MongoDB модели (Students, Weights)
- `public/` - статические файлы (CSS, JavaScript)
- `views/` - Handlebars шаблоны
  - `layouts/` - основной шаблон
  - `pages/` - страницы приложения
  - `partials/` - переиспользуемые компоненты
- `test/` - тесты

## Требования

- Node.js 14+
- MongoDB (локальное подключение на `mongodb://127.0.0.1:27017/stipendia`)

## Деплой на Vercel

1. Создайте кластер в MongoDB Atlas и получите строку подключения (например, `mongodb+srv://<user>:<pass>@cluster0.mongodb.net/stipendia`).
2. Загрузите проект в GitHub (репозиторий должен содержать `vercel.json`).
3. На vercel.com создайте новый проект и импортируйте репозиторий.
4. В настройках проекта (Project Settings → Environment Variables) добавьте переменные окружения:
  - `MONGODB_URL` — строка подключения из MongoDB Atlas
5. Vercel использует `@vercel/node` для запуска `server.js`. В `server.js` приложение экспортируется как модуль, а локальный запуск выполняется только когда файл запускается напрямую. Это позволяет корректно работать на Vercel и локально.

Пример локального запуска (development):

```bash
npm install
npm run dev
```

После добавления переменной `MONGODB_URL` в Vercel проект автоматически задеплоится при пуше в ветку, связанную с проектом.
