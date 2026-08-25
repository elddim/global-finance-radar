export default async function handler(req, res) {
  try {

    // 第一版先用比較單純的搜尋條件
    const query =
      '(economy OR inflation OR stocks OR bitcoin OR semiconductor)';

    const url =
      "https://api.gdeltproject.org/api/v2/doc/doc" +
      "?query=" + encodeURIComponent(query) +
      "&mode=artlist" +
      "&maxrecords=30" +
      "&timespan=24h" +
      "&sort=datedesc" +
      "&format=json";

    console.log("GDELT URL:", url);

    const response = await fetch(url);

    // 先取得文字，而不是直接假設一定是 JSON
    const text = await response.text();

    if (!response.ok) {
      return res.status(500).json({
        success: false,
        error: "GDELT 回應失敗",
        status: response.status,
        detail: text.slice(0, 500)
      });
    }

    let data;

    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({
        success: false,
        error: "GDELT 回傳的不是 JSON",
        detail: text.slice(0, 500)
      });
    }

    const articles =
      Array.isArray(data.articles)
        ? data.articles
        : [];

    const cleanedArticles =
      articles.map(article => ({
        title:
          article.title || "無標題",

        url:
          article.url || "#",

        source:
          article.domain ||
          article.sourcecountry ||
          "未知來源",

        language:
          article.language || "",

        date:
          article.seendate || "",

        image:
          article.socialimage || ""
      }));

    res.setHeader(
      "Cache-Control",
      "s-maxage=600, stale-while-revalidate=1800"
    );

    return res.status(200).json({
      success: true,
      source: "GDELT",
      updatedAt: new Date().toISOString(),
      count: cleanedArticles.length,
      articles: cleanedArticles
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      error: "伺服器發生錯誤",
      detail: error.message
    });

  }
}
