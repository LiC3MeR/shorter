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
            // Подсчитываем количество уникальных кликов (по уникальным IP-адресам)
            const uniqueClicks = await Click.count({
                where: {
                    urlId: url.id,
                },
            });

            // Получаем последний IP-адрес, с которого был клик
            const lastClick = await Click.findOne({
                where: { urlId: url.id },
                order: [['createdAt', 'DESC']], // Последний клик
                attributes: ['ipAddress'],
            });

            links.push({
                shortUrl: `${process.env.BASE_URL}/${url.shortId}`,
                originalUrl: url.originalUrl,
                clicks: url.clicks, // Общее количество кликов
                uniqueClicks, // Уникальные клики
                lastIp: lastClick ? lastClick.ipAddress : null, // Последний IP, если есть
            });
        }

        res.status(200).json({ links });
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving links' });
    }
});

router.get('/:shortId', async (req, res) => {
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress; // Получаем IP-адрес

    try {
        const url = await Url.findOne({ where: { shortId: req.params.shortId } });
        if (url) {
            // Проверяем, был ли уже клик с этого IP-адреса
            const existingClick = await Click.findOne({
                where: {
                    urlId: url.id,
                    ipAddress,
                },
            });

            if (!existingClick) {
                // Если клика с этого IP ещё не было, сохраняем его
                await Click.create({
                    urlId: url.id,
                    ipAddress,
                });

                // Увеличиваем количество уникальных кликов
                url.clicks += 1;
                await url.save();
            }

            return res.redirect(url.originalUrl);
        }
        res.status(404).json({ error: 'URL not found' });
    } catch (error) {
        res.status(500).json({ error: 'Error resolving URL' });
    }
});

module.exports = router;
