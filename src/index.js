import express from 'express';
import { chromium } from 'playwright';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/episodes/:slug', async (req, res) => {
  const { slug } = req.params;
  const url = `https://jkanime.net/${slug}/`;

  try {
    console.log(`🌐 Navegando a: ${url}`);
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });

    await page.waitForSelector('#episodes-content', { timeout: 20000 });

    const episodes = await page.$$eval('#episodes-content .epcontent', elements =>
      elements.map(el => {
        const href = el.querySelector('a')?.href;
        const title = el.querySelector('.cap_num span')?.textContent?.trim();
        return { title, href };
      })
    );

    await browser.close();
    console.log(`📺 Total de episodios extraídos: ${episodes.length}`);
    res.json({ episodes });
  } catch (error) {
    console.error('❌ Error al obtener episodios:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/', (req, res) => {
  res.send('✅ API JKAnime 🌀 Online');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
