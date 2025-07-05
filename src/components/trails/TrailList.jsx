import React, { useState, useEffect } from "react";
import TrailCard from "./TrailCard";

function TrailList(props) {
  const [expandedMountain, setExpandedMountain] = useState(null);
  const [sortOption, setSortOption] = useState("전체");

  useEffect(() => {
    setExpandedMountain(null);
  }, [props.collapseAllTrigger]);

  if (!Array.isArray(props.trailData)) {
    return null;
  }

  // 산 이름 별로 하나의 그룹 생성
  const groupedByMountain = props.trailData.reduce((acc, trail) => {
    const mountain = trail.properties.mntn_nm || "Unknown";
    if (!acc[mountain]) {
      acc[mountain] = [];
    }
    acc[mountain].push(trail);
    return acc;
  }, {});

  const mountainNames = Object.keys(groupedByMountain);

  // 클릭 시 카드 목록 열고 닫기
  function toggleMountain(mountain) {
    setExpandedMountain((prev) => {
      if (prev === mountain) {
        return null;
      }
      return mountain;
    });
  }

  function handleSortChange(e){
    setSortOption(e.target.value);
  }

  let sortedMountainNames = [...mountainNames];

  if (sortOption === "가나다순") {
    sortedMountainNames.sort((a, b) => a.localeCompare(b));
  } else if (sortOption === "낮은거리순") {
    sortedMountainNames.sort((a, b) => {
      const totalA = groupedByMountain[a].reduce((sum, trail) => sum + Number(trail.properties.sec_len.length || 0), 0);
      const totalB = groupedByMountain[b].reduce((sum, trail) => sum + Number(trail.properties.sec_len.length || 0), 0);
      return totalA - totalB;
    });
  } else if (sortOption === "높은거리순") {
    sortedMountainNames.sort((a, b) => {
      const totalA = groupedByMountain[a].reduce((sum, trail) => sum + Number(trail.properties.sec_len.length || 0), 0);
      const totalB = groupedByMountain[b].reduce((sum, trail) => sum + Number(trail.properties.sec_len.length || 0), 0);
      return totalB - totalA;
    });
  }

  function getTotalDistance(trails) {
    return trails.reduce((sum, trail) => {
      const len = parseFloat(trail.properties.sec_len);
      return sum + (isNaN(len) ? 0 : len);
    }, 0).toFixed(2); // 소수점 2자리
  }




  return (
    <div className="trailList">
      {sortedMountainNames.length > 0 && (
      <>
        <div className="listAttribute">
          <select value={sortOption} onChange={handleSortChange}>
            <option value="전체">전체</option>
            <option value="가나다순">가나다순</option>
            <option value="낮은거리순">총 낮은거리순</option>
            <option value="높은거리순">총 높은거리순</option>
          </select>
        </div>      
        {sortedMountainNames.map((name) => {
          const trails = groupedByMountain[name];
          if (!trails) {
            return null;
          }
          const isExpanded = expandedMountain === name;
          return (
            <div key={name} style={{ marginBottom: "12px" }}>
              <div 
                className="mpaListItem"
                onClick={() => toggleMountain(name)}
              >
                {name} ({getTotalDistance(trails)} Km) {isExpanded ? (
                  <div className="right up">▲</div>
                ) : (
                  <div className="right down">▼</div>
                )}
              </div>
              {isExpanded && (
                <div
                  style={{
                    padding: "16px",
                    marginTop: "8px",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(114px, 1fr))",
                    gap: "10px",
                  }}
                >
                  {trails.map((trail) => {
                    return (
                      <TrailCard
                        key={trail.id}
                        trail={trail}
                        selectedTrail={props.selectedTrail}
                        setSelectedTrail={props.setSelectedTrail}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}        
      </>
      )}

    </div>
  );
}

export default TrailList;
