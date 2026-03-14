import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getShopItems, buyItem, getUser } from "../services/api";
import "./Shop.css";

const Shop = ({ userId, onBack }) => {
  const navigate = useNavigate();
  const [shopItems, setShopItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({ nickname: "", money: 0 });
  const [selectedItem, setSelectedItem] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [purchaseMessage, setPurchaseMessage] = useState("");
  const [ownedItems, setOwnedItems] = useState(new Set());
  const [equippedItemId, setEquippedItemId] = useState(null);

  // 로컬 스토리지 키 생성 함수
  const getStorageKey = (uid) => `fishing_game_inventory_${uid}`;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log("Shop: useEffect triggered. userId:", userId);

        let currentUserInfo = { nickname: "", money: 0, rod_level: 1 };
        if (userId) {
          currentUserInfo = await getUser(userId);
          console.log("Shop: Fetched userInfo from API:", currentUserInfo);
          setUserInfo(currentUserInfo);
        } else {
          console.warn("Shop: No userId provided!");
        }

        const items = await getShopItems();
        const formattedItems = Array.isArray(items) ? items : items.items || [];
        setShopItems(formattedItems);

        // 로컬 스토리지에서 보유 아이템 및 장착 정보 불러오기
        if (userId) {
          const key = getStorageKey(userId);
          const savedData = localStorage.getItem(key);
          let loadedOwned = new Set();
          let loadedEquipped = null;

          if (savedData) {
            const parsed = JSON.parse(savedData);
            loadedOwned = new Set(parsed.ownedItems || []);
            loadedEquipped = parsed.equippedItemId;
          }

          // 기본 아이템(ID 0)은 항상 보유 처리
          loadedOwned.add(0);

          // API의 rod_level과 동기화: 현재 장착된 아이템 ID 찾기
          const currentRodItem = formattedItems.find(
            (item) => item.rod_level === currentUserInfo.rod_level
          );

          if (currentRodItem) {
            loadedEquipped = currentRodItem.item_id;
            // 현재 장착된 건 당연히 보유 중
            loadedOwned.add(currentRodItem.item_id);
          }

          setOwnedItems(loadedOwned);
          setEquippedItemId(loadedEquipped);

          // 업데이트된 정보 다시 저장 (동기화)
          localStorage.setItem(
            key,
            JSON.stringify({
              ownedItems: Array.from(loadedOwned),
              equippedItemId: loadedEquipped,
            })
          );
        }
      } catch (error) {
        console.error("Failed to fetch shop data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleBuy = async () => {
    if (!selectedItem || !userId) return;

    try {
      console.log(
        `Buying item: user_id=${userId}, item_id=${selectedItem.item_id}`
      );
      const response = await buyItem(userId, selectedItem.item_id);

      setPurchaseMessage(response?.message || "구매에 성공했습니다!");
      setShowConfirm(false);
      setShowSuccess(true);

      // 구매 후 유저 정보 갱신
      const updatedUser = await getUser(userId);
      setUserInfo(updatedUser);

      // 로컬 스토리지 업데이트
      const newOwned = new Set(ownedItems);
      newOwned.add(selectedItem.item_id);

      setOwnedItems(newOwned);
      setEquippedItemId(selectedItem.item_id);

      localStorage.setItem(
        getStorageKey(userId),
        JSON.stringify({
          ownedItems: Array.from(newOwned),
          equippedItemId: selectedItem.item_id,
        })
      );
    } catch (error) {
      console.error("Purchase failed:", error);
      let errorMsg = "구매에 실패했습니다.";
      const detail = error.response?.data?.detail;

      if (typeof detail === "string") {
        errorMsg = detail;
      } else if (Array.isArray(detail) && detail.length > 0) {
        errorMsg = detail[0]?.msg || errorMsg;
      } else if (detail?.msg) {
        errorMsg = detail.msg;
      }

      setPurchaseMessage(errorMsg);
      setShowConfirm(false);
      setShowSuccess(true);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="shop-screen">
      <div className="shop-content">
        <div className="shop-header">
          <h2>🎣 상점</h2>
          <div className="shop-user-info">
            <span className="shop-user-name">👤 {userInfo.nickname}</span>
            <span className="shop-user-money">
              💰 {userInfo.money?.toLocaleString()}원
            </span>
          </div>
        </div>

        {loading ? (
          <div className="shop-loading">로딩 중...</div>
        ) : (
          <div className="shop-items">
            {shopItems.length > 0 ? (
              shopItems.map((item, index) => (
                <div
                  key={item.item_id !== undefined ? item.item_id : index}
                  className={`shop-item ${
                    equippedItemId === item.item_id ? "equipped" : ""
                  } ${ownedItems.has(item.item_id) ? "owned" : ""}`}
                  onClick={() => {
                    // 이미 장착중이면 클릭 무시? 혹은 안내 메시지?
                    if (equippedItemId === item.item_id) return;

                    setSelectedItem(item);
                    setShowConfirm(true);
                  }}
                >
                  {equippedItemId === item.item_id && (
                    <div className="shop-badge equipped">장착중</div>
                  )}
                  {equippedItemId !== item.item_id &&
                    ownedItems.has(item.item_id) && (
                      <div className="shop-badge owned">보유중</div>
                    )}
                  <img
                    src={item.image_url || "/fishing_rod.png"}
                    alt={item.name}
                  />
                  <div className="shop-item-info">
                    <p className="shop-item-name">{item.name}</p>
                    <p className="shop-item-price">
                      {item.price?.toLocaleString()}원
                    </p>
                    {item.description && (
                      <p className="shop-item-effect">{item.description}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="shop-empty">상점에 아이템이 없습니다.</p>
            )}
          </div>
        )}

        <button className="shop-close-btn" onClick={handleBack}>
          닫기
        </button>
      </div>

      {/* 구매 확인 모달 */}
      {showConfirm && selectedItem && (
        <div className="purchase-confirm-modal">
          <div className="modal-content">
            <h3>{selectedItem.name}</h3>
            <p className="purchase-price">
              가격: {selectedItem.price?.toLocaleString()}원
            </p>
            {ownedItems.has(selectedItem.item_id) ? (
              <p>
                이미 보유 중인 아이템입니다.
                <br />
                장착하시겠습니까?
              </p>
            ) : (
              <p>구매하시겠습니까?</p>
            )}
            <div className="modal-buttons">
              <button onClick={handleBuy}>확인</button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setSelectedItem(null);
                }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 결과 모달 */}
      {showSuccess && (
        <div className="purchase-confirm-modal">
          <div className="modal-content">
            <p>{purchaseMessage}</p>
            <div className="modal-buttons">
              <button
                onClick={() => {
                  setShowSuccess(false);
                  setSelectedItem(null);
                  setPurchaseMessage("");
                }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
