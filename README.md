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
