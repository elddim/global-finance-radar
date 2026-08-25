export default async function handler(req, res) {
  try {
    const target =
      "https://www.whitehouse.gov/presidential-actions/";

    const response = await fetch(target, {
      headers: {
        "User-Agent":
          "GlobalFinanceRadar/1.0 (+https://vercel.app)"
      }
    });

    if (!response.ok) {
      throw new Error(
        `White House HTTP ${response.status}`
      );
    }

    const html = await response.text();

    /*
      這版先只測試：
      1. White House 能不能被 Vercel 抓到
      2. 回傳 HTML 是否正常
      下一版再解析文章標題、日期、網址
    */

    return res.status(200).json({
      ok: true,
      source: "The White House",
      sourceType: "official",
      credibility: "A+",
      page: target,
      fetchedAt: new Date().toISOString(),
      htmlLength: html.length,
      message:
        "White House 官方頁面已成功取得"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      ok: false,
      source: "The White House",
      error:
        "無法取得 White House 官方資料",
      detail: error.message
    });
  }
}
