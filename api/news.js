export default async function handler(req, res) {
  try {
    const query =
      '(economy OR stocks OR inflation OR "interest rates" OR bitcoin OR semiconductor OR "artificial intelligence")';

    const params = new URLSearchParams({
      query,
      mode: "artlist",
      maxrecords: "20",
      timespan: "24h",
      sort: "datedesc",
      format: "json"
    });

    const url =
      `https://api.gdeltproject.org/api/v2/doc/doc?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Global-Finance-Radar/1.0"
      }
    });

    if (!response.ok) {
      throw new Error(`GDELT API error: ${response.status}`);
    }

    const data = await response.json();

    const articles = (data.articles || []).map((article) => ({
      title: article.title || "無標題",
      url: article.url || "#",
      source:
        article.domain ||
        article.sourcecountry ||
        "未知來源",
      language: article.language || "",
      date: article.seendate || "",
      image: article.socialimage || ""
    }));

    res.setHeader(
      "Cache-Control",
      "s-maxage=600, stale-while-revalidate=1800"
    );

    res.status(200).json({
      success: true,
      updatedAt: new Date().toISOString(),
      count: articles.length,
      articles
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "目前無法取得國際財經新聞。",
      details: error.message
    });
  }
}
