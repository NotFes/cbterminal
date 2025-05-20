// server.js
const express = require('express');
const fs = require('fs/promises'); // Используем fs/promises для асинхронной работы с файлами
const path = require('path');
const cors = require('cors'); // Модуль для обработки CORS-заголовков

const app = express();
const PORT = 3000; // Порт, на котором будет работать ваш сервер
const DATA_FILE = path.join(__dirname, 'id_list.json'); // Путь к файлу id_list.json

// Middleware для разрешения CORS-запросов
// В реальном приложении, замените '*' на домен вашего фронтэнда (например, 'https://your-github-pages-url.github.io')
app.use(cors());

// Middleware для парсинга JSON-тела запросов
app.use(express.json());

// --- API Endpoint для получения данных аккаунтов ---
// GET /api/accounts
// Читает id_list.json и отправляет его содержимое клиенту
app.get('/api/accounts', async (req, res) => {
    try {
        // Проверяем, существует ли файл id_list.json
        await fs.access(DATA_FILE);
        const data = await fs.readFile(DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        if (error.code === 'ENOENT') {
            // Если файл не найден, отправляем пустой массив
            console.log('id_list.json не найден. Отправляем пустой массив.');
            res.json([]);
        } else {
            console.error('Ошибка чтения id_list.json:', error);
            res.status(500).json({ message: 'Ошибка сервера при чтении данных.' });
        }
    }
});

// --- API Endpoint для сохранения данных аккаунтов ---
// POST /api/accounts
// Принимает JSON-данные от клиента и записывает их в id_list.json
app.post('/api/accounts', async (req, res) => {
    try {
        const updatedData = req.body; // Получаем обновленные данные из тела запроса
        // Валидация данных (опционально, но рекомендуется для реальных приложений)
        if (!Array.isArray(updatedData)) {
            return res.status(400).json({ message: 'Неверный формат данных. Ожидается массив.' });
        }

        // Записываем данные в id_list.json. null, 2 делает JSON красиво отформатированным.
        await fs.writeFile(DATA_FILE, JSON.stringify(updatedData, null, 2), 'utf8');
        res.status(200).json({ message: 'Данные успешно сохранены на сервере.' });
        console.log('Данные успешно сохранены в id_list.json');
    } catch (error) {
        console.error('Ошибка записи id_list.json:', error);
        res.status(500).json({ message: 'Ошибка сервера при сохранении данных.' });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер Node.js запущен на порту ${PORT}`);
    console.log(`Доступен по адресу: http://localhost:${PORT}`);
    console.log(`Файл данных: ${DATA_FILE}`);
});
