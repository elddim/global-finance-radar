export default async function handler(req, res) {
  try {
    const data = {
      ok: true,
      source: "Federal Reserve",
      message: "Vercel API 已正常運作",
      time: new Date().toISOString()
    };

    res.status(200).json(data);

  } catch (error) {

    res.status(500).json({
      ok: false,
      error: "API 發生錯誤"
    });

  }
}
