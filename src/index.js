import express from 'express';
import { chromium } from 'playwright';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/episodes/:slug', async (req, res) => {
  const { slug } = req.params;
  const url = `https://jkanime.net/${slug}/`;

  console.log(`🌐 Navegando a: ${url}`);

  try {
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 45000
    });

    await page.waitForSelector('#episodes-content', { timeout: 10000 });

    const episodes = await page.evaluate(() => {
      const episodeElements = document.querySelectorAll('#episodes-content .epcontent');
      return Array.from(episodeElements).map(el => {
        const href = el.querySelector('a')?.href;
        const title = el.querySelector('.cap_num span')?.textContent?.trim();
        return { title, href };
      });
    });

    await browser.close();

    console.log(`📺 Total de episodios extraídos: ${episodes.length}`);
    res.json({ episodes });

  } catch (error) {
    console.error('❌ Error al obtener episodios:', error);
    res.status(500).json({ error: 'Error al obtener episodios' });
  }
});

app.get('/', (req, res) => {
  res.send('✅ API JKAnime 🌀 Online');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
