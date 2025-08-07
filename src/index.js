import express from 'express';
import puppeteer from 'puppeteer';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/episodes/:slug', async (req, res) => {
  const { slug } = req.params;
  const url = `https://jkanime.net/${slug}/`;

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    const episodes = await page.evaluate(() => {
      const episodeElements = document.querySelectorAll('#episodes-content .epcontent');
      return Array.from(episodeElements).map(el => {
        const href = el.querySelector('a')?.href;
        const title = el.querySelector('.cap_num span')?.textContent?.trim();
        return { title, href };
      });
    });

    await browser.close();
    res.json({ episodes });
  } catch (error) {
    console.error("❌ Error en /episodes:", error);
    res.status(500).json({ error: 'Error al obtener episodios' });
  }
});

app.get('/', (req, res) => {
  res.send('✅ API JKAnime 🌀 Online');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
