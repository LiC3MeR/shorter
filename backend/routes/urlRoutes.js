const express = require('express');
const { customAlphabet } = require('nanoid');
const Url = require('../models/Url');
const Click = require('../models/Click');
const router = express.Router();

// Настройка алфавита и длины ID
const generateShortId = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 5);

router.post('/shorten', async (req, res) => {
    const { originalUrl } = req.body;
    const shortId = generateShortId(); // Генерация короткой ссылки
    const baseUrl = process.env.BASE_URL;

    try {
        const url = await Url.create({ originalUrl, shortId });
        res.status(201).json({ shortUrl: `${baseUrl}/${shortId}` });
    } catch (error) {
        res.status(500).json({ error: 'Error creating short URL' });
    }
});

// Эндпоинт для получения всех существующих ссылок
router.get('/links', async (req, res) => {
    try {
        const urls = await Url.findAll(); // Получаем все записи из базы
        const links = [];

        for (const url of urls) {
            // Подсчитываем все клики (не уникальные)
            const totalClicks = url.clicks; // Общее количество кликов из поля `clicks` модели `Url`

            // Подсчитываем уникальные клики (по уникальным IP)
            const uniqueClicks = await Click.count({
                distinct: true, // Подсчитываем только уникальные IP-адреса
                where: { urlId: url.id },
                col: 'ipAddress', // Для уникальности по IP
            });

            // Получаем последний IP-адрес, с которого был клик
            const lastClick = await Click.findOne({
                where: { urlId: url.id },
                order: [['createdAt', 'DESC']], // Последний клик по времени
                attributes: ['ipAddress'],
            });

            links.push({
                shortUrl: `${process.env.BASE_URL}/${url.shortId}`,
                originalUrl: url.originalUrl,
                clicks: totalClicks, // Общее количество кликов
                uniqueClicks, // Уникальные клики
                lastIp: lastClick ? lastClick.ipAddress : 'Нет переходов', // Последний IP, если есть
            });
        }

        res.status(200).json({ links });
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving links' });
    }
});``

router.get('/:shortId', async (req, res) => {
    try {
        const url = await Url.findOne({ where: { shortId: req.params.shortId } });
        if (url) {
            url.clicks += 1; // Обновляем общее количество кликов
            await url.save();

            // Получаем реальный IP-адрес клиента
            const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

            // Если прокси прислал несколько адресов, берем первый
            const realIp = ipAddress.split(',')[0];

            // Сохраняем информацию о клике с реальным IP-адресом
            await Click.create({
                urlId: url.id,
                ipAddress: realIp.trim(), // Убираем лишние пробелы
            });

            return res.redirect(url.originalUrl);
        }
        res.status(404).json({ error: 'URL not found' });
    } catch (error) {
        res.status(500).json({ error: 'Error resolving URL' });
    }
});

module.exports = router;
