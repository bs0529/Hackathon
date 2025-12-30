import React from "react";
import "./ResultOverlay.css";

const ResultOverlay = ({
  result,
  caughtFish,
  onRelease,
  onSell,
  onSendToAquarium,
  actionResult,
  onClose,
}) => {
  const isSick = caughtFish?.is_sick || false;

  return (
    <div className="result-overlay-backdrop">
      <div className="result-overlay">
        {result === "success" ? (
          <>
            {actionResult ? (
              // 액션 결과 표시
              <>
                <h3
                  className={`result-title ${
                    actionResult.success ? "success" : "fail"
                  }`}
                >
                  {actionResult.success ? "완료!" : "실패"}
                </h3>
                <p className="action-result-message">{actionResult.message}</p>
                {actionResult.money && (
                  <p className="action-result-money">
                    + {actionResult.money} 골드
                  </p>
                )}
              </>
            ) : (
              // 물고기 잡은 결과 표시
              <>
                <h3
                  className={`result-title success ${
                    isSick ? "sick-fish" : ""
                  }`}
                >
                  {caughtFish ? caughtFish.name : "Unknown Fish"}
                </h3>
                {caughtFish && (
                  <div className="model-wrapper">
                    <img
                      src={caughtFish.image2d}
                      alt={caughtFish.name}
                      style={{
                        width: "100%",
                        height: "120px",
                        objectFit: "contain",
                        backgroundColor: "#e0f7fa",
                        borderRadius: "8px",
                        filter: isSick
                          ? "hue-rotate(90deg) saturate(1.5)"
                          : "none",
                      }}
                    />
                  </div>
                )}
                {isSick && (
                  <p className="sick-warning">⚠️ 이 물고기는 병들어 있습니다</p>
                )}
                <p className="success-text">
                  {caughtFish && caughtFish.habitat
                    ? `서식지: ${caughtFish.habitat}`
                    : "Great Job!"}
                </p>

                <div className="result-buttons">
                  <button
                    className="result-btn release-btn"
                    onClick={onRelease}
                  >
                    방생
                  </button>
                  <button className="result-btn sell-btn" onClick={onSell}>
                    판매
                  </button>
                  <button
                    className={`result-btn aquarium-btn ${
                      isSick ? "disabled" : ""
                    }`}
                    onClick={isSick ? undefined : onSendToAquarium}
                    disabled={isSick}
                    title={
                      isSick
                        ? "병든 물고기는 아쿠아리움으로 보낼 수 없습니다"
                        : ""
                    }
                  >
                    아쿠아리움 수송
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <h2 className="result-title fail">FAILED...</h2>
            <p className="fail-text">다시 시도해보세요!</p>
            <div className="result-buttons">
              <button
                className="result-btn"
                onClick={onClose}
                style={{
                  marginTop: "20px",
                  backgroundColor: "#555",
                  color: "white",
                }}
              >
                확인
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResultOverlay;
