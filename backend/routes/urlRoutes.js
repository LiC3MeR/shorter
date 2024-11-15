const express = require('express');
const { customAlphabet } = require('nanoid');
const Url = require('../models/Url');
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
        const links = urls.map(url => ({
            shortUrl: `${process.env.BASE_URL}/${url.shortId}`,
            originalUrl: url.originalUrl,
            clicks: url.clicks
        }));
        res.status(200).json({ links });
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving links' });
    }
});

router.get('/:shortId', async (req, res) => {
    try {
        const url = await Url.findOne({ where: { shortId: req.params.shortId } });
        if (url) {
            url.clicks += 1;
            await url.save();
            return res.redirect(url.originalUrl);
        }
        res.status(404).json({ error: 'URL not found' });
    } catch (error) {
        res.status(500).json({ error: 'Error resolving URL' });
    }
});

module.exports = router;
