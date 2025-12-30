import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "./Collection.css";
import { getCollection } from "../../services/api";

// meis_data의 JSON 파일명과 생물 이름을 매칭하는 맵 (전체 89종)
const nameToGlbMap = {
  가시닻해삼: "201701.glb",
  가시해마: "201823.glb",
  갯게: "201806.glb",
  거머리말: "201702.glb",
  검붉은수지맨드라미: "201808.glb",
  검은머리물떼새: "201703.glb",
  게바다말: "201820.glb",
  고래상어: "201825.glb",
  고리무늬물범: "201704.glb",
  귀신고래: "201902.glb",
  금빛나팔돌산호: "201908.glb",
  기수갈고둥: "201907.glb",
  긴가지해송: "201915.glb",
  깃산호: "201809.glb",
  나팔고둥: "201705.glb",
  남방방게: "201805.glb",
  남방큰돌고래: "201706.glb",
  넓적부리도요: "201917.glb",
  노랑부리백로: "201707.glb",
  눈콩게: "201912.glb",
  달랑게: "201708.glb",
  대왕고래: "201802.glb",
  대추귀고둥: "201709.glb",
  두이빨사각게: "201913.glb",
  둔한진총산호: "201807.glb",
  띠무늬물범: "201804.glb",
  망둥어: "201710.glb",
  망상맵시산호: "201810.glb",
  망해송: "202002.glb",
  매부리바다거북: "201821.glb",
  물개: "201711.glb",
  미립이분지돌산호: "201914.glb",
  바다사자: "201905.glb",
  바다쇠오리: "201828.glb",
  바다오리: "201830.glb",
  바다제비: "201918.glb",
  밤게: "201712.glb",
  밤수지맨드라미: "201713.glb",
  범고래: "202201.glb",
  별혹산호: "201811.glb",
  보리고래: "201903.glb",
  복해마: "201824.glb",
  북방긴수염고래: "201901.glb",
  분홍접시조개: "201714.glb",
  붉은바다거북: "201715.glb",
  붉은발말똥게: "201716.glb",
  브라이드고래: "201717.glb",
  빗자루해송: "201916.glb",
  뿔쇠오리: "201826.glb",
  삼나무말: "201718.glb",
  상괭이: "201719.glb",
  새우말: "201720.glb",
  선침거미불가사리: "201812.glb",
  쇠가마우지: "201919.glb",
  수거머리말: "201818.glb",
  슴새: "201827.glb",
  실해송: "202001.glb",
  아비: "201721.glb",
  알락꼬리마도요: "201722.glb",
  연수지맨드라미: "201813.glb",
  올리브바다거북: "202202.glb",
  왕거머리말: "201819.glb",
  유착나무돌산호: "201814.glb",
  의염통성게: "201815.glb",
  자색수지맨드라미: "201816.glb",
  잔가지나무돌산호: "201906.glb",
  장수거북: "201822.glb",
  장수삿갓조개: "201723.glb",
  저어새: "201724.glb",
  점박이물범: "201725.glb",
  점해마: "201726.glb",
  착생깃산호: "201909.glb",
  참고래: "201801.glb",
  청다리도요사촌: "201727.glb",
  측맵시산호: "201728.glb",
  칠게: "201729.glb",
  칠면초: "201730.glb",
  큰바다사자: "201803.glb",
  포기거머리말: "201817.glb",
  푸른바다거북: "201731.glb",
  피뿔고둥: "201732.glb",
  해송: "201910.glb",
  향고래: "201904.glb",
  혹등고래: "201733.glb",
  홍살귀상어: "201734.glb",
  흑범고래: "202203.glb",
  흰발농게: "201735.glb",
  흰수염바다오리: "201829.glb",
  흰수지맨드라미: "201911.glb",
};

function CollectionDetail() {
  const { fishId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [fish, setFish] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 컴포넌트 마운트 시 스크롤을 최상단으로
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchFish = async () => {
      try {
        setIsLoading(true);
        const savedUser = localStorage.getItem("ocean_rescue_user");
        if (!savedUser) {
          throw new Error("로그인 정보를 찾을 수 없습니다.");
        }

        const userData = JSON.parse(savedUser);
        const userId = userData.id;

        const data = await getCollection(userId);
        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

        const formattedData = data.map((item) => {
          const glbFileName = nameToGlbMap[item.name];
          return {
            species_id: item.species_id,
            name: item.name,
            type: item.type,
            image_url: `${BACKEND_URL}${item.image_url}`,
            model_url: glbFileName ? `/assets/models/${glbFileName}` : null,
            caught_count: item.caught_count,
            is_caught: item.is_caught,
            habitat: item.habitat,
            description: item.DstcftCn || "특징 정보가 없습니다.",
          };
        });

        const selectedFish = formattedData.find(
          (f) => f.species_id === parseInt(fishId)
        );

        if (selectedFish && selectedFish.is_caught) {
          setFish(selectedFish);
        } else {
          navigate("/collection");
        }
      } catch (err) {
        console.error("물고기 데이터 로딩 실패:", err);
        navigate("/collection");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFish();
  }, [fishId, navigate]);

  if (isLoading) {
    return (
      <div className="collection-detail-page">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (!fish) {
    return null;
  }

  const handleBackClick = () => {
    // location.state에서 from 확인
    if (location.state?.from === "aquarium") {
      navigate("/aquarium");
    } else {
      navigate("/collection");
    }
  };

  // location.state에서 from 값 가져오기 (aquarium 또는 collection)
  const backgroundClass =
    location.state?.from === "aquarium"
      ? "collection-detail-page aquarium-background"
      : "collection-detail-page";

  return (
    <div className={backgroundClass}>
      <button className="detail-back-btn" onClick={handleBackClick}>
        ← 뒤로
      </button>

      <div className="detail-content">
        {/* 3D Model Section - model-viewer */}
        <div className="detail-image-section">
          <model-viewer
            src={fish.model_url}
            alt={fish.name}
            camera-controls
            auto-rotate
            autoplay
            auto-rotate-delay="0"
            rotation-per-second="30deg"
            shadow-intensity="1"
            style={{
              width: "100%",
              height: "100%",
              background: "transparent",
            }}
          ></model-viewer>
        </div>

        <div className="detail-info-box">
          <div className="detail-name-section">
            <h2 className="detail-fish-name">{fish.name}</h2>
            <span className="detail-fish-id">
              No.{String(fish.species_id).padStart(3, "0")}
            </span>
          </div>

          <div className="detail-stats-grid">
            <div className="detail-stat-item">
              <span className="stat-label">종류</span>
              <span className="stat-value">{fish.type}</span>
            </div>
            <div className="detail-stat-item">
              <span className="stat-label">서식지</span>
              <span className="stat-value">{fish.habitat}</span>
            </div>
            <div className="detail-stat-item">
              <span className="stat-label">획득</span>
              <span className="stat-value">×{fish.caught_count}</span>
            </div>
          </div>

          <div className="detail-description">
            <h3 className="description-title">설명</h3>
            <p className="description-text">{fish.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CollectionDetail;
