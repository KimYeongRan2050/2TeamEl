import { useState, useEffect } from "react";
import $ from "jquery";
import { getHikingUrl } from "../api/hikingTrails";

async function fetchTrailDataPage(lat, lon, min, max, diff, page = 1) {
  const url = getHikingUrl(lat, lon, min, max, diff, page);
  console.log(`▶ Fetching trails page ${page}:`, url);

  return new Promise((resolve, reject) => {
    $.ajax({
      url: url,
      dataType: "jsonp",
      success: (data) => {
        if (!data?.response) {
          reject(new Error("Invalid API response structure"));
          return;
        }

        // Extract features based on different possible structures
        const fc = data.response.result?.featureCollection;
        let features = [];

        if (Array.isArray(fc?.features)) {
          features = fc.features;
        } else if (Array.isArray(fc)) {
          features = fc;
        } else if (Array.isArray(data?.features)) {
          features = data.features;
        }

        resolve({
          features,
          totalPages: parseInt(data.response.page?.total) || 1,
          currentPage: parseInt(data.response.page?.current) || 1,
          totalRecords: parseInt(data.response.record?.total) || features.length,
        });
      },
      error: reject,
    });
  });
}

async function fetchAllTrailData(lat, lon, min, max, diff) {
  try {
    // First fetch to get total pages
    const firstPage = await fetchTrailDataPage(lat, lon, min, max, diff, 1);
    const totalPages = firstPage.totalPages;

    // If only one page, return immediately
    if (totalPages <= 1) {
      return firstPage.features;
    }

    // Fetch remaining pages in parallel
    const pagePromises = [];
    for (let page = 2; page <= totalPages; page++) {
      pagePromises.push(fetchTrailDataPage(lat, lon, min, max, diff, page));
    }

    const remainingPages = await Promise.all(pagePromises);

    // Combine all features
    const allFeatures = firstPage.features.concat(...remainingPages.map((page) => page.features));

    console.log(`✅ Fetched all ${allFeatures.length} records across ${totalPages} pages`);
    return allFeatures;
  } catch (err) {
    console.error("Error fetching trail data:", err);
    throw err;
  }
}

export function useTrailData(lat, lon, minRange, maxRange, difficulty) {
  const [trailData, setTrailData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (lat == null || lon == null) {
      setTrailData([]);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const allFeatures = await fetchAllTrailData(lat, lon, minRange, maxRange, difficulty);
        setTrailData(allFeatures);
      } catch (err) {
        setError(err);
        setTrailData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [lat, lon, minRange, maxRange, difficulty]);

  return {
    data: trailData,
    isLoading,
    error,
  };
}
