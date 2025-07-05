import React, { useState, useEffect } from "react";
import HikingMap from "../components/map/HikingMap";
import TrailList from "../components/trails/TrailList";
import SearchFilterSection from "../components/search/SearchFilterSection";
import { useTrailData } from "../hooks/useTrailData";
import { useWeatherData } from "../hooks/useWeatherData";

export default function MainPage() {
  const [keyword, setKeyword] = useState("");
  const [minRange, setMinRange] = useState("");
  const [maxRange, setMaxRange] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [searched, setSearched] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const [selectedTrail, setSelectedTrail] = useState(null);
  const [collapseAllTrigger, setCollapseAllTrigger] = useState(0);

  const [zoom, setZoom] = useState(1);
  const [containerHeight, setContainerHeight] = useState(800);

  const weatherData = useWeatherData(lat, lon);

  const {
    data: trailData,
    isLoading: trailsLoading,
    error: trailsError,
  } = useTrailData(lat, lon, minRange, maxRange, difficulty, searched);

  // 창 크기에 따라서 검색 결과 div zoom 컨트롤
  useEffect(() => {
    const baseWidth = 1280;
    const baseHeight = 800;
    const maxHeight = 800;

    function handleResize() {
      const scale = window.innerWidth / baseWidth;
      const scaledHeight = baseHeight * scale;

      if (scaledHeight > maxHeight) {
        setZoom(maxHeight / baseHeight);
        setContainerHeight(maxHeight);
      } else {
        setZoom(scale);
        setContainerHeight(scaledHeight);
      }
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (trailsLoading === false && searched === true) {
      setSearched(false);
    }
  }, [trailsLoading, searched, showMap]);

  // 키워드 입력 시 검색 초기화
  useEffect(() => {
    setSearched(false);
  }, [keyword]);

  function handleSearch() {
    if (keyword.trim() === "") {
      return;
    }
    setSearched(true);
    setShowMap(true);
  }

  function clearSelection() {
    setSelectedTrail(null);
    setCollapseAllTrigger((prev) => prev + 1);
  }

  return (
    <div className="mainContainer">
      <h1 className="title">About Hiking Trail Data</h1>
      
      <SearchFilterSection
        keyword={keyword}
        setKeyword={setKeyword}
        handleSearch={handleSearch}
        minRange={minRange}
        setMinRange={setMinRange}
        maxRange={maxRange}
        setMaxRange={setMaxRange}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
      />
      <div
        id="searchResults"
        style={{
          display: "flex",
          height: containerHeight,
          alignItems: "stretch",
          zoom: zoom,
        }}
      >
        {showMap && (
          <HikingMap
            keyword={keyword}
            searched={searched}
            trailData={trailData}
            selectedTrail={selectedTrail}
            setSelectedTrail={setSelectedTrail}
            onCenterChanged={(lat, lon) => {
              setLat(lat);
              setLon(lon);
            }}
            onClearSelection={clearSelection}
            style={{ width: 600, height: "100%" }}
          />
        )}

        {!trailsLoading && !trailsError && (
          <TrailList
            trailData={trailData}
            selectedTrail={selectedTrail}
            setSelectedTrail={setSelectedTrail}
            collapseAllTrigger={collapseAllTrigger}
            style={{ flexGrow: 1, overflowY: "auto", height: "100%" }}
          />
        )}
      </div>
    </div>
  );
}
