import React, { useState } from "react";
import "./Collection.css";

// Mock data - meis_data 폴더의 실제 JSON 데이터 기반 (33개)
const mockFishData = [
  {
    species_id: 1,
    name: "저어새",
    type: "바닷새",
    image_url: "/assets/images/sticker_저어새.png",
    model_url: "/assets/models/201724.glb",
    caught_count: 3,
    is_caught: true,
    habitat: "갯벌",
    description:
      "몸은 흰색이며 주걱 모양의 주름이 많고 긴 검은 부리가 특징입니다. 몸길이는 60~78.5cm입니다.",
    rarity: "희귀",
  },
  {
    species_id: 2,
    name: "알락꼬리마도요",
    type: "바닷새",
    image_url: "/assets/images/sticker_알락꼬리마도요.png",
    model_url: "/assets/models/201725.glb",
    caught_count: 2,
    is_caught: true,
    habitat: "갯벌",
    description:
      "긴 부리로 갯벌의 먹이를 찾는 철새입니다. 긴 다리가 특징입니다.",
    rarity: "일반",
  },
  {
    species_id: 3,
    name: "검은머리물떼새",
    type: "바닷새",
    image_url: "/assets/images/sticker_검은머리물떼새.png",
    model_url: "/assets/models/201726.glb",
    caught_count: 1,
    is_caught: true,
    habitat: "연안",
    description:
      "검은 머리가 특징인 물떼새입니다. 빠르게 달리며 먹이를 찾습니다.",
    rarity: "일반",
  },
  {
    species_id: 4,
    name: "아비",
    type: "바닷새",
    image_url: "/assets/images/sticker_아비.png",
    model_url: "/assets/models/201727.glb",
    caught_count: 0,
    is_caught: false,
    habitat: "바다",
    description: "잠수를 잘하는 대형 물새입니다. 물고기를 잡아먹고 살아갑니다.",
    rarity: "일반",
  },
  {
    species_id: 5,
    name: "청다리도요사촌",
    type: "바닷새",
    image_url: "/assets/images/sticker_청다리도요사촌.png",
    model_url: "/assets/models/201728.glb",
    caught_count: 1,
    is_caught: true,
    habitat: "갯벌",
    description: "긴 다리와 부리로 갯벌에서 먹이를 찾는 철새입니다.",
    rarity: "일반",
  },
  {
    species_id: 6,
    name: "노랑부리백로",
    type: "바닷새",
    image_url: "/assets/images/sticker_노랑부리백로.png",
    model_url: "/assets/models/201729.glb",
    caught_count: 0,
    is_caught: false,
    habitat: "연안",
    description:
      "노란 부리가 특징인 백로입니다. 얕은 물가에서 물고기를 잡습니다.",
    rarity: "희귀",
  },
  {
    species_id: 7,
    name: "나팔고둥",
    type: "무척추동물",
    image_url: "/assets/images/sticker_나팔고동.png",
    model_url: "/assets/models/201705.glb",
    caught_count: 2,
    is_caught: true,
    habitat: "바닷속 암반",
    description:
      "껍질의 길이가 20cm 이상 대형 고둥으로 원추형이며 옅은 주홍색을 띱니다.",
    rarity: "희귀",
  },
  {
    species_id: 8,
    name: "대추귀고둥",
    type: "무척추동물",
    image_url: "/assets/images/sticker_대추귀고동.png",
    model_url: "/assets/models/201706.glb",
    caught_count: 0,
    is_caught: false,
    habitat: "바닷속 암반",
    description: "대추 모양의 독특한 형태를 가진 고둥입니다.",
    rarity: "일반",
  },
  {
    species_id: 9,
    name: "밤수지맨드라미",
    type: "무척추동물",
    image_url: "/assets/images/sticker_밤수지맨드라미.png",
    model_url: "/assets/models/201713.glb",
    caught_count: 3,
    is_caught: true,
    habitat: "바닷속 암반",
    description:
      "몸통은 촉수 덩어리 부분에서 주황색, 촉수는 붉은색을 띱니다. 높이 약 30cm입니다.",
    rarity: "전설",
  },
  {
    species_id: 10,
    name: "장수삿갓조개",
    type: "무척추동물",
    image_url: "/assets/images/sticker_장수삿갓조개.png",
    model_url: "/assets/models/201711.glb",
    caught_count: 0,
    is_caught: false,
    habitat: "바닷속 암반",
    description: "삿갓 모양의 독특한 조개입니다. 바위에 붙어 살아갑니다.",
    rarity: "일반",
  },
  {
    species_id: 11,
    name: "측맵시산호",
    type: "무척추동물",
    image_url: "/assets/images/sticker_측맵시산호.png",
    model_url: "/assets/models/201712.glb",
    caught_count: 1,
    is_caught: true,
    habitat: "바닷속 암반",
    description: "아름다운 형태의 산호입니다. 암반에 군집을 이룹니다.",
    rarity: "희귀",
  },
  {
    species_id: 12,
    name: "달랑게",
    type: "무척추동물",
    image_url: "/assets/images/sticker_달랑게.png",
    model_url: "/assets/models/201714.glb",
    caught_count: 0,
    is_caught: false,
    habitat: "갯벌",
    description: "갯벌에 사는 작은 게입니다. 구멍을 파고 살아갑니다.",
    rarity: "일반",
  },
  {
    species_id: 13,
    name: "흰발농게",
    type: "무척추동물",
    image_url: "/assets/images/sticker_흰발농게.png",
    model_url: "/assets/models/201715.glb",
    caught_count: 2,
    is_caught: true,
    habitat: "갯벌",
    description:
      "흰색 집게발이 특징인 농게입니다. 갯벌 생태계의 중요한 구성원입니다.",
    rarity: "일반",
  },
  {
    species_id: 14,
    name: "분홍접시조개",
    type: "무척추동물",
    image_url: "/assets/images/sticker_분홍접시조개.png",
    model_url: "/assets/models/201716.glb",
    caught_count: 0,
    is_caught: false,
    habitat: "바닷속 암반",
    description: "분홍색 접시 모양의 아름다운 조개입니다.",
    rarity: "희귀",
  },
  {
    species_id: 15,
    name: "피뿔고둥",
    type: "무척추동물",
    image_url: "/assets/images/sticker_피뿔고둥.png",
    model_url: "/assets/models/201717.glb",
    caught_count: 1,
    is_caught: true,
    habitat: "바닷속 암반",
    description: "뿔 모양의 돌기가 있는 고둥입니다. 독특한 외형이 특징입니다.",
    rarity: "일반",
  },
  {
    species_id: 16,
    name: "붉은발말똥게",
    type: "무척추동물",
    image_url: "/assets/images/sticker_붉은발말똥게.png",
    model_url: "/assets/models/201718.glb",
    caught_count: 0,
    is_caught: false,
    habitat: "갯벌",
    description:
      "붉은색 발이 특징인 게입니다. 갯벌의 유기물을 먹고 살아갑니다.",
    rarity: "일반",
  },
  {
    species_id: 17,
    name: "밤게",
    type: "무척추동물",
    image_url: "/assets/images/sticker_밤게.png",
    model_url: "/assets/models/201701.glb",
    caught_count: 3,
    is_caught: true,
    habitat: "갯벌",
    description: "밤색의 작은 게입니다. 갯벌에서 흔히 볼 수 있습니다.",
    rarity: "일반",
  },
  {
    species_id: 18,
    name: "칠게",
    type: "무척추동물",
    image_url: "/assets/images/sticker_칠게.png",
    model_url: "/assets/models/201702.glb",
    caught_count: 0,
    is_caught: false,
    habitat: "갯벌",
    description: "일곱 개의 다리를 가진 것처럼 보이는 게입니다.",
    rarity: "일반",
  },
  {
    species_id: 19,
    name: "가시닻해삼",
    type: "무척추동물",
    image_url: "/assets/images/sticker_가시닻해삼.png",
    model_url: "/assets/models/201703.glb",
    caught_count: 1,
    is_caught: true,
    habitat: "바닷속 암반",
    description: "가시가 있는 해삼입니다. 바다 밑바닥을 기어 다닙니다.",
    rarity: "희귀",
  },
  {
    species_id: 20,
    name: "혹등고래",
    type: "포유류",
    image_url: "/assets/images/sticker_혹등고래.png",
    model_url: "/assets/models/201720.glb",
    caught_count: 0,
    is_caught: false,
    habitat: "바다",
    description:
      "등에 혹이 있는 대형 고래입니다. 아름다운 노랫소리로 유명합니다.",
    rarity: "전설",
  },
  {
    species_id: 21,
    name: "브라이드고래",
    type: "포유류",
    image_url: "/assets/images/sticker_브라이드고래.png",
    model_url: "/assets/models/201722.glb",
    caught_count: 0,
    is_caught: false,
    habitat: "바다",
    description: "온대 해역에 서식하는 중형 수염고래입니다.",
    rarity: "전설",
  },
  {
    species_id: 22,
    name: "물개",
    type: "포유류",
    image_url: "/assets/images/sticker_물개.png",
    model_url: "/assets/models/201723.glb",
    caught_count: 1,
    is_caught: true,
    habitat: "연안",
    description: "귀가 있는 물범과 동물입니다. 뛰어난 수영 실력을 자랑합니다.",
    rarity: "희귀",
  },
  {
    species_id: 23,
    name: "고리무늬물범",
    type: "포유류",
    image_url: "/assets/images/sticker_고리무늬물범.png",
    model_url: "/assets/models/201730.glb",
    caught_count: 0,
    is_caught: false,
    habitat: "연안",
    description: "몸에 고리 모양의 무늬가 있는 물범입니다.",
    rarity: "희귀",
  },
  {
    species_id: 24,
    name: "상괭이",
    type: "포유류",
    image_url: "/assets/images/sticker_상괭이.png",
    model_url: "/assets/models/201719.glb",
    caught_count: 5,
    is_caught: true,
    habitat: "바다",
    description:
      "한국 연안에 서식하는 작은 돌고래입니다. 귀여운 외모를 가지고 있습니다.",
    rarity: "희귀",
  },
  {
    species_id: 25,
    name: "남방큰돌고래",
    type: "포유류",
    image_url: "/assets/images/sticker_남방큰돌고래.png",
    model_url: "/assets/models/201731.glb",
    caught_count: 0,
    is_caught: false,
    habitat: "바다",
    description: "큰 몸집의 돌고래입니다. 무리를 지어 생활합니다.",
    rarity: "희귀",
  },
  {
    species_id: 26,
    name: "점박이물범",
    type: "포유류",
    image_url: "/assets/images/sticker_점박이물범.png",
    model_url: "/assets/models/201721.glb",
    caught_count: 2,
    is_caught: true,
    habitat: "연안",
    description:
      "점무늬가 특징인 물범입니다. 얼음 위에서 쉬는 것을 좋아합니다.",
    rarity: "희귀",
  },
  {
    species_id: 27,
    name: "삼나무말",
    type: "해조류",
    image_url: "/assets/images/sticker_삼나무말.png",
    model_url: "/assets/models/201707.glb",
    caught_count: 0,
    is_caught: false,
    habitat: "바다숲",
    description: "삼나무처럼 생긴 해조류입니다. 바다숲을 형성합니다.",
    rarity: "일반",
  },
  {
    species_id: 28,
    name: "새우말",
    type: "해조류",
    image_url: "/assets/images/sticker_새우말.png",
    model_url: "/assets/models/201708.glb",
    caught_count: 1,
    is_caught: true,
    habitat: "바다숲",
    description: "새우가 좋아하는 해조류입니다. 작은 생물들의 서식처가 됩니다.",
    rarity: "일반",
  },
  {
    species_id: 29,
    name: "거머리말",
    type: "해조류",
    image_url: "/assets/images/sticker_거머리말.png",
    model_url: "/assets/models/201709.glb",
    caught_count: 3,
    is_caught: true,
    habitat: "바다숲",
    description: "바다 밑에서 자라는 해초입니다. 많은 생물의 서식처가 됩니다.",
    rarity: "일반",
  },
  {
    species_id: 30,
    name: "칠면초",
    type: "해조류",
    image_url: "/assets/images/sticker_칠면초.png",
    model_url: "/assets/models/201704.glb",
    caught_count: 0,
    is_caught: false,
    habitat: "갯벌",
    description: "염생식물로 갯벌에서 자랍니다. 가을이 되면 붉게 물듭니다.",
    rarity: "일반",
  },
  {
    species_id: 31,
    name: "점해마",
    type: "어류",
    image_url: "/assets/images/sticker_점해마.png",
    model_url: "/assets/models/201732.glb",
    caught_count: 0,
    is_caught: false,
    habitat: "바다숲",
    description: "점무늬가 있는 해마입니다. 꼬리로 해조류를 감고 생활합니다.",
    rarity: "희귀",
  },
  {
    species_id: 32,
    name: "홍살귀상어",
    type: "어류",
    image_url: "/assets/images/sticker_홍살귀상어.png",
    model_url: "/assets/models/201733.glb",
    caught_count: 0,
    is_caught: false,
    habitat: "바다",
    description:
      "붉은 지느러미가 특징인 상어입니다. 온순한 성격을 가지고 있습니다.",
    rarity: "전설",
  },
  {
    species_id: 33,
    name: "망둥어",
    type: "어류",
    image_url: "/assets/images/sticker_망둥어.png",
    model_url: "/assets/models/201710.glb",
    caught_count: 7,
    is_caught: true,
    habitat: "갯벌",
    description:
      "몸길이는 10~20cm 정도입니다. 배지느러미는 맞붙어 흡반을 이룹니다.",
    rarity: "일반",
  },
];

const HABITATS = [
  "전체",
  "갯벌",
  "바다",
  "바다숲",
  "바닷속 암반",
  "연안",
  "하구역",
];

function Collection({ onClose }) {
  const [selectedHabitat, setSelectedHabitat] = useState("전체");
  const [selectedFish, setSelectedFish] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // "list" or "detail"

  // Filter fish by habitat
  const filteredFish =
    selectedHabitat === "전체"
      ? mockFishData
      : mockFishData.filter((fish) => fish.habitat === selectedHabitat);

  const handleFishClick = (fish) => {
    if (fish.is_caught) {
      setSelectedFish(fish);
      setViewMode("detail");
    }
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedFish(null);
  };

  // Detail View
  if (viewMode === "detail" && selectedFish) {
    return (
      <div className="collection-detail-page">
        <button className="detail-back-btn" onClick={handleBackToList}>
          ← 뒤로
        </button>

        <div className="detail-content">
          {/* 3D Model Section - model-viewer */}
          <div className="detail-image-section">
            <model-viewer
              src={selectedFish.model_url}
              alt={selectedFish.name}
              camera-controls
              auto-rotate
              autoplay
              auto-rotate-delay="0"
              rotation-per-second="30deg"
              shadow-intensity="1"
              style={{
                width: "100%",
                height: "100%",
                background: "rgba(255, 255, 255, 0.95)",
              }}
            ></model-viewer>
          </div>

          <div className="detail-info-box">
            <div className="detail-name-section">
              <h2 className="detail-fish-name">{selectedFish.name}</h2>
              <span className="detail-fish-id">
                No.{String(selectedFish.species_id).padStart(3, "0")}
              </span>
            </div>

            <div className="detail-stats-grid">
              <div className="detail-stat-item">
                <span className="stat-label">종류</span>
                <span className="stat-value">{selectedFish.type}</span>
              </div>
              <div className="detail-stat-item">
                <span className="stat-label">등급</span>
                <span className={`stat-value rarity-${selectedFish.rarity}`}>
                  {selectedFish.rarity}
                </span>
              </div>
              <div className="detail-stat-item">
                <span className="stat-label">서식지</span>
                <span className="stat-value">{selectedFish.habitat}</span>
              </div>
              <div className="detail-stat-item">
                <span className="stat-label">획득</span>
                <span className="stat-value">×{selectedFish.caught_count}</span>
              </div>
            </div>

            <div className="detail-description">
              <h3 className="description-title">설명</h3>
              <p className="description-text">{selectedFish.description}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="collection-list-page">
      <button className="collection-close-btn" onClick={onClose}>
        ✕
      </button>

      <div className="collection-header">
        <h1 className="collection-title">다나까 도감</h1>
        <div className="collection-stats">
          <span className="stat-badge">
            {mockFishData.filter((f) => f.is_caught).length}/
            {mockFishData.length}
          </span>
        </div>
      </div>

      {/* Habitat Filter */}
      <div className="habitat-filter">
        {HABITATS.map((habitat) => (
          <button
            key={habitat}
            className={`habitat-btn ${
              selectedHabitat === habitat ? "active" : ""
            }`}
            onClick={() => setSelectedHabitat(habitat)}
          >
            {habitat}
          </button>
        ))}
      </div>

      {/* Fish Grid - 6 per row */}
      <div className="fish-grid">
        {filteredFish.map((fish) => (
          <div
            key={fish.species_id}
            className={`fish-card ${fish.is_caught ? "caught" : "locked"}`}
            onClick={() => handleFishClick(fish)}
          >
            <div className="fish-image-container">
              {fish.is_caught ? (
                <img
                  src={fish.image_url}
                  alt={fish.name}
                  className="fish-sticker-image"
                />
              ) : (
                <div className="fish-silhouette">❓</div>
              )}
            </div>
            <div className="fish-info">
              <div className="fish-id">
                No.{String(fish.species_id).padStart(3, "0")}
              </div>
              <div className="fish-name">
                {fish.is_caught ? fish.name : "???"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Collection;
