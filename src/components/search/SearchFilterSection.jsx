import React from "react";
import SearchBar from "./SearchBar";
import RangeInput from "./RangeInput";
import DifficultyDropdown from "./DifficultyDropdown";

// 검색창 키워드 입력
// 등산로 최소 최대 길이 - 직접 숫자 입력
// 등산로 난이도 - 드랍다운

const SearchFilterSection = ({
  keyword,
  setKeyword,
  handleSearch,
  minRange,
  setMinRange,
  maxRange,
  setMaxRange,
  difficulty,
  setDifficulty,
}) => {
  return (
    <div className="search-section">
      <SearchBar keyword={keyword} setKeyword={setKeyword} onSearch={handleSearch} />
      <div className="filter-section">
        <div className="range-section">
          <span>거리</span>
          <RangeInput value={minRange} setValue={setMinRange} placeholder="최소" />
          <RangeInput value={maxRange} setValue={setMaxRange} placeholder="최대" />
        </div>
        <div className="difficulty-section">
          <span>난이도</span>
          <DifficultyDropdown value={difficulty} setValue={setDifficulty} />
        </div>
      </div>
    </div>
  );
};

export default SearchFilterSection;
