import React, { useEffect, useRef, useState } from "react";
import CategorySelector from "../../api/categoryselector";

const kakaoApiKey = "5f283b38458e2a36a38d8894a017f5de";

function HikingMap(props) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const allPolylines = useRef([]);
  const allOverlays = useRef([]);
  const selectedPolyline = useRef(null);
  const selectedOverlay = useRef(null);
  const categoryMarkers = useRef([]);

  const [mapReady, setMapReady] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const myLocationMarker = useRef(null);
  const [isSearching, setIsSearching] = useState(false);

  const createMarkers = (positions, spriteY) => {
    return positions.map(([lat, lng]) => {
      const markerImage = new window.kakao.maps.MarkerImage(
        "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/category.png",
        new window.kakao.maps.Size(22, 26),
        {
          spriteOrigin: new window.kakao.maps.Point(10, spriteY),
          spriteSize: new window.kakao.maps.Size(36, 98),
        }
      );
      return new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(lat, lng),
        image: markerImage,
      });
    });
  };

  function extractCoords(geometry) {
    if (!geometry || !geometry.coordinates) {
      return [];
    }
    if (typeof geometry.coordinates[0][0] === "number") {
      return geometry.coordinates;
    } else {
      return geometry.coordinates[0];
    }
  }

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "//dapi.kakao.com/v2/maps/sdk.js?appkey=" +
      kakaoApiKey +
      "&libraries=services&autoload=false";
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => {
        const center = new window.kakao.maps.LatLng(37.5665, 126.978);
        const options = {
          center: center,
          level: 5,
        };
        mapInstance.current = new window.kakao.maps.Map(mapRef.current, options);

        window.kakao.maps.event.addListener(mapInstance.current, "rightclick", (mouseEvent) => {
          const lat = mouseEvent.latLng.getLat();
          const lon = mouseEvent.latLng.getLng();
          props.onCenterChanged(lat, lon);

          if (markerRef.current) {
            markerRef.current.setMap(null);
            markerRef.current = null;
          }
          markerRef.current = new window.kakao.maps.Marker({
            map: mapInstance.current,
            position: mouseEvent.latLng,
          });

          allPolylines.current.forEach((poly) => poly.setMap(null));
          allPolylines.current = [];
          if (selectedPolyline.current) {
            selectedPolyline.current.setMap(null);
            selectedPolyline.current = null;
          }
          if (selectedOverlay.current) {
            selectedOverlay.current.setMap(null);
            selectedOverlay.current = null;
          }

          if (props.onClearSelection) {
            props.onClearSelection();
          }
        });

        setMapReady(true);
      });
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      allPolylines.current.forEach((poly) => poly.setMap(null));
      allPolylines.current = [];
      if (selectedPolyline.current) {
        selectedPolyline.current.setMap(null);
        selectedPolyline.current = null;
      }
      if (selectedOverlay.current) {
        selectedOverlay.current.setMap(null);
        selectedOverlay.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !Array.isArray(props.trailData) || !mapInstance.current) {
      return;
    }

    allPolylines.current.forEach((poly) => poly.setMap(null));
    allPolylines.current = [];
    allOverlays.current.forEach((ov) => ov.setMap(null));
    allOverlays.current = [];

    props.trailData.forEach((trail) => {
      const coords = extractCoords(trail.geometry);
      if (!Array.isArray(coords) || coords.length === 0) return;

      const path = coords.map((pair) => new window.kakao.maps.LatLng(pair[1], pair[0]));
      const polyline = new window.kakao.maps.Polyline({
        path: path,
        strokeWeight: 2,
        strokeColor: "#FF0000",
        strokeOpacity: 0.7,
        strokeStyle: "solid",
      });
      polyline.setMap(mapInstance.current);

      window.kakao.maps.event.addListener(polyline, "click", () => {
        if (props.setSelectedTrail) {
          props.setSelectedTrail(trail);
        }
      });

      const content = `<div class="trail-overlay">${trail.properties.mntn_nm} / ${trail.properties.sec_len}m / ${trail.properties.cat_nam}</div>`;
      const overlay = new window.kakao.maps.CustomOverlay({
        position: path[Math.floor(path.length / 2)],
        content: content,
        yAnchor: 1,
        zIndex: 3,
      });

      // trail-overlay 내부에 클릭 이벤트 바인딩
      const div = document.createElement("div");
      div.innerHTML = content;

      const overlayElement = div.querySelector(".trail-overlay");
      if (overlayElement && props.setSelectedTrail) {
        overlayElement.addEventListener("click", () => {
          props.setSelectedTrail(trail);
        });
      }
      overlay.setContent(div);

      window.kakao.maps.event.addListener(polyline, "mouseover", () => {
        if (selectedOverlay.current) {
          selectedOverlay.current.setMap(null);
        }
        allOverlays.current.forEach((ov) => {
          ov.setMap(null);
        });
        overlay.setMap(mapInstance.current);
      });

      allPolylines.current.push(polyline);
      allOverlays.current.push(overlay);
    });
  }, [props.trailData, mapReady]);

  useEffect(() => {
    if (selectedPolyline.current) {
      selectedPolyline.current.setMap(null);
      selectedPolyline.current = null;
    }
    if (selectedOverlay.current) {
      selectedOverlay.current.setMap(null);
      selectedOverlay.current = null;
    }
    if (props.selectedTrail) {
      const coords = extractCoords(props.selectedTrail.geometry);
      if (coords.length === 0) return;

      const path = coords.map((pair) => new window.kakao.maps.LatLng(pair[1], pair[0]));
      selectedPolyline.current = new window.kakao.maps.Polyline({
        path: path,
        strokeWeight: 6,
        strokeColor: "#2cc532",
        strokeOpacity: 1,
        strokeStyle: "solid",       
      });
      selectedPolyline.current.setMap(mapInstance.current);

      const midPoint = path[Math.floor(path.length / 2)];
      const content = `<div class="trail-overlay selected">${props.selectedTrail.properties.mntn_nm} / ${props.selectedTrail.properties.sec_len}m / ${props.selectedTrail.properties.cat_nam}</div>`;

      allOverlays.current.forEach((ov) => {
        ov.setMap(null);
      });

      selectedOverlay.current = new window.kakao.maps.CustomOverlay({
        position: path[Math.floor(path.length / 2)],
        content: content,
        yAnchor: 1,
        zIndex: 5,
      });

      selectedOverlay.current.setMap(mapInstance.current);

      const startPoint = path[0];
      mapInstance.current.panTo(startPoint);
    }
  }, [props.selectedTrail, mapReady]);

  useEffect(() => {
    if (!mapReady || !props.searched || !props.keyword || !window.kakao || !mapInstance.current) {
      return;
    }

    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(props.keyword, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
        const first = result[0];
        const lat = parseFloat(first.y);
        const lon = parseFloat(first.x);
        const position = new window.kakao.maps.LatLng(lat, lon);
        mapInstance.current.setCenter(position);

        if (markerRef.current) {
          markerRef.current.setMap(null);
        }
        markerRef.current = new window.kakao.maps.Marker({
          map: mapInstance.current,
          position: position,
        });
        props.onCenterChanged(lat, lon);
      }
    });
  }, [props.searched, props.keyword, mapReady]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setIsSearching(true); // 검색 시작 시 버튼 비활성화

    // 모든 카테고리 버튼에서 'on' 클래스 제거
    document.querySelectorAll("#category li.on").forEach((el) => {
      el.classList.remove("on");
    });
    
    if (!mapInstance.current || !window.kakao || !categoryId) {
      setIsSearching(false);
      return;
    }

    const ps = new window.kakao.maps.services.Places(mapInstance.current);
    categoryMarkers.current.forEach(m => m.setMap(null));
    categoryMarkers.current = [];

    ps.categorySearch(
      categoryId,
      (data, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const order = parseInt(document.querySelector(`#${categoryId}`)?.dataset?.order || 0);

          data.forEach((place) => {
            const markerImage = new window.kakao.maps.MarkerImage(
              "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/places_category.png",
              new window.kakao.maps.Size(27, 28),
              {
                spriteSize: new window.kakao.maps.Size(72, 208),
                spriteOrigin: new window.kakao.maps.Point(46, order * 36),
                offset: new window.kakao.maps.Point(11, 28),
              }
            );

            const marker = new window.kakao.maps.Marker({
              map: mapInstance.current,
              position: new window.kakao.maps.LatLng(place.y, place.x),
              image: markerImage,
            });

            const content = document.createElement("div");
            content.className = "placeinfo_wrap";
            content.innerHTML = `
              <div class="placeinfo">
                <a class="title" href="${place.place_url}" target="_blank">${place.place_name}</a>
                <span>${place.road_address_name || place.address_name}</span>
                <span class="tel">${place.phone || ""}</span>
              </div>
              <div class="after"></div>
            `;

            const overlay = new window.kakao.maps.CustomOverlay({
              content,
              position: new window.kakao.maps.LatLng(place.y, place.x),
              yAnchor: 1,
              zIndex: 3,
            });

            window.kakao.maps.event.addListener(marker, "click", () => {
              overlay.setMap(mapInstance.current);
            });

            categoryMarkers.current.push(marker);
          });
        }
        setIsSearching(false); // 검색 완료 후 버튼 다시 활성화
      },
      { useMapBounds: true }
    );
  };

  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      alert("이 브라우저에서는 위치 정보가 지원되지 않습니다.");
      return;
    }

    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const loc = new window.kakao.maps.LatLng(lat, lng);

      // 기존 마커 제거
      if (myLocationMarker.current) {
        myLocationMarker.current.setMap(null);
      }

      // 새 마커 생성
      myLocationMarker.current = new window.kakao.maps.Marker({
        map: mapInstance.current,
        position: loc,
        title: "현 위치",
      });

      // 지도 중심 이동
      mapInstance.current.setCenter(loc);
    },
      (error) => {
        alert("현위치 정보를 가져올 수 없습니다.");
        console.error(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div id="mapwrap">
      <div id="hikingMap" ref={mapRef}></div>
      <button onClick={handleMyLocation} className="accessLocation" title="현 위치">현 위치</button>
      <CategorySelector 
        selected={selectedCategory} 
        onSelect={handleCategoryChange}
        disabled={isSearching}
      />
    </div>
  );
}

export default HikingMap;
