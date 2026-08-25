export default async function handler(req, res) {
  try {

    const query =
      'economy OR stocks OR inflation OR "Federal Reserve" OR AI OR semiconductor OR bitcoin';

    const rssUrl =
      "https://news.google.com/rss/search?" +
      new URLSearchParams({
        q: query,
        hl: "en-US",
        gl: "US",
        ceid: "US:en"
      }).toString();

    const response = await fetch(rssUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 Global-Finance-Radar/1.0"
      }
    });

    if (!response.ok) {
      throw new Error(
        `Google News RSS 回應錯誤：${response.status}`
      );
    }

    const xml = await response.text();

    const items =
      [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];

    const articles =
      items.slice(0, 30).map(match => {

        const item = match[1];

        const title =
          getTag(item, "title");

        const link =
          getTag(item, "link");

        const pubDate =
          getTag(item, "pubDate");

        const source =
          getSource(item);

        return {
          title: cleanText(title),
          url: cleanText(link),
          source: cleanText(source || "Google News"),
          date: pubDate,
          language: "English"
        };

      }).filter(article =>
        article.title &&
        article.url
      );


    res.setHeader(
      "Cache-Control",
      "s-maxage=600, stale-while-revalidate=1800"
    );

    return res.status(200).json({
      success: true,
      source: "Google News RSS",
      updatedAt: new Date().toISOString(),
      count: articles.length,
      articles: articles
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      error: "目前無法取得新聞",
      detail: error.message
    });

  }
}


/* 取得一般 XML 標籤 */

function getTag(xml, tag) {

  const regex =
    new RegExp(
      `<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`,
      "i"
    );

  const match =
    xml.match(regex);

  if (!match) {
    return "";
  }

  return match[1];

}


/* Google News 的 source 有屬性 */

function getSource(xml) {

  const match =
    xml.match(
      /<source[^>]*>([\s\S]*?)<\/source>/i
    );

  return match
    ? match[1]
    : "";

}


/* 清除 XML / HTML 特殊格式 */

function cleanText(text) {

  if (!text) {
    return "";
  }

  return text

    .replace(
      /<!\[CDATA\[([\s\S]*?)\]\]>/g,
      "$1"
    )

    .replace(
      /&amp;/g,
      "&"
    )

    .replace(
      /&quot;/g,
      '"'
    )

    .replace(
      /&#39;/g,
      "'"
    )

    .replace(
      /&lt;/g,
      "<"
    )

    .replace(
      /&gt;/g,
      ">"
    )

    .trim();

}
