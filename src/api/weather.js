import { latlonToGrid } from "../utils/latlonToGrid";

const publicDataApiKey = `ErCuM5KvYasv6PiohNILSbv%2BloBCCBgMSv2rgzbrGMxQpVDNjuLn%2B3yhaGiW3ftEEcm58h0r%2BIUpyn8bJi4lLQ%3D%3D`;

const weather = {
  url: `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?`,
  pageNo: 1,
  numOfRows: 1000,
  dataType: "json",
  base_time: "0200",
};

function getTodayDateString() {
  const now = new Date();
  if (now.getHours() < 2) {
    now.setDate(now.getDate() - 1);
  }
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

export function getWeatherUrl(lat, lon) {
  const params = [];

  params.push("serviceKey=" + publicDataApiKey);
  params.push("pageNo=" + weather.pageNo);
  params.push("numOfRows=" + weather.numOfRows);
  params.push("dataType=" + weather.dataType);
  params.push("base_date=" + getTodayDateString());
  params.push("base_time=" + weather.base_time);

  if (lat !== null && lon !== null) {
    const { x: nx, y: ny } = latlonToGrid(lat, lon);
    params.push("nx=" + nx);
    params.push("ny=" + ny);
  }

  return weather.url + params.join("&");
}
