import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (_, res) => {
  res.send("API de JKAnime funcionando 🎉");
});

app.get("/search", async (req, res) => {
  const query = req.query.q?.toString() || "";

  if (!query) {
    return res.status(400).json({ error: "Falta el parámetro ?q=" });
  }

  try {
    const searchUrl = `https://jkanime.net/buscar/${encodeURIComponent(query)}/`;
    const { data: html } = await axios.get(searchUrl);
    const $ = cheerio.load(html);

    const results: any[] = [];

    $(".anime__item").each((_, el) => {
      const title = $(el).find(".anime__item__text h5 a").text().trim();
      const href = $(el).find(".anime__item__text h5 a").attr("href");
      const img = $(el).find(".anime__item__pic").attr("data-setbg");

      if (title && href) {
        results.push({
          title,
          href: href.startsWith("http") ? href : `https://jkanime.net${href}`,
          image: img || ""
        });
      }
    });

    res.json(results);
  } catch (error) {
    console.error("[/search] Error:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.listen(PORT, () => {
  console.log("Servidor en puerto", PORT);
});
