import express from "express";
import axios from "axios";
import cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/search", async (req, res) => {
  const { q } = req.query;

  if (!q || typeof q !== "string") {
    return res.status(400).json({ error: "Parámetro 'q' requerido" });
  }

  try {
    const url = `https://jkanime.net/buscar/${encodeURIComponent(q)}/`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const results: any[] = [];

    $(".anime__item").each((_, el) => {
      const title = $(el).find(".anime__item__text h5 a").text().trim();
      const href = $(el).find(".anime__item__text h5 a").attr("href");
      const image = $(el).find(".anime__item__pic").attr("data-setbg");

      if (title && href) {
        results.push({
          title,
          href: `https://jkanime.net${href}`,
          image: image || ""
        });
      }
    });

    res.json(results);
  } catch (err) {
    console.error("Error en /search", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.get("/", (_, res) => {
  res.send("🎉 API JKAnime funcionando.");
});

app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`);
});
