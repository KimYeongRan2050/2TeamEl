const vworldApiKey = `31198BF5-179E-3380-947F-F97448ED7D34`;

const hiking = {
  url: "https://api.vworld.kr/req/data?",
  domain: "localhost:3000",
  service: "data",
  request: "getfeature",
  format: "json",
  data: "LT_L_FRSTCLIMB",
  size: 1000,
  page: 1,
};

function round(num) {
  return Math.round(num * 1000) / 1000;
}

function setGeomFilter(point, bufferKm) {
  const bufferLat = bufferKm / 111;
  const bufferLon = bufferKm / (111 * Math.cos((point.y * Math.PI) / 180));

  const minx = round(point.x - bufferLon);
  const maxx = round(point.x + bufferLon);
  const miny = round(point.y - bufferLat);
  const maxy = round(point.y + bufferLat);

  return `BOX(${minx},${miny},${maxx},${maxy})`;
}

function setAttrFilter(min, max, diff) {
  const filters = [];

  if (min && max) {
    filters.push(`sec_len:between:${min},${max}`);
  } else if (min) {
    filters.push(`sec_len:>=:${min}`);
  } else if (max) {
    filters.push(`sec_len:<=:${max}`);
  }

  if (diff && diff !== "전체") {
    filters.push(`cat_nam:=:${diff}`);
  }

  return filters.join("|");
}

export function getHikingUrl(lat, lon, min, max, diff) {
  const params = [];

  params.push("key=" + vworldApiKey);
  params.push("service=" + hiking.service);
  params.push("request=" + hiking.request);
  params.push("format=" + hiking.format);
  params.push("data=" + hiking.data);
  params.push("size=" + hiking.size);
  params.push("domain=" + hiking.domain);

  let geomFilter = null;
  let attrFilter = null;

  if (lat !== null && lon !== null) {
    geomFilter = setGeomFilter({ x: lon, y: lat }, 3);
    params.push("geomFilter=" + geomFilter);
  }

  if (geomFilter) {
    attrFilter = setAttrFilter(min, max, diff);
    if (attrFilter) {
      params.push("attrFilter=" + attrFilter);
    }
  }

  return hiking.url + params.join("&");
}
