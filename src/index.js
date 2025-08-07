import express from 'express';
import puppeteer from 'puppeteer';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/episodes/:slug', async (req, res) => {
  const { slug } = req.params;
  const url = `https://jkanime.net/${slug}/`;

  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36'
    );

    console.log(`🌐 Navegando a: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Espera a que cargue el contenedor de episodios (si no, lanza warning)
    await page.waitForSelector('#episodes-content', { timeout: 10000 }).catch(() =>
      console.warn('⚠️ No se encontró #episodes-content en el DOM.')
    );

    // Captura HTML para debug
    const html = await page.content();
    console.log('🧾 HTML (primeros 500 chars):', html.slice(0, 500));

    // Captura de pantalla para verificar carga
    await page.screenshot({ path: 'page.png' });

    const episodes = await page.evaluate(() => {
      const items = document.querySelectorAll('#episodes-content .epcontent');
      return Array.from(items).map(el => {
        const href = el.querySelector('a')?.href;
        const title = el.querySelector('.cap_num span')?.textContent?.trim();
        return { title, href };
      });
    });

    await browser.close();

    console.log(`📺 Total de episodios extraídos: ${episodes.length}`);
    res.json({ episodes });
  } catch (error) {
    console.error('❌ Error al obtener episodios:', error.message);
    res.status(500).json({ error: 'Error al obtener episodios' });
  }
});

app.get('/', (req, res) => {
  res.send('✅ API JKAnime 🌀 Online');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
