import axios from "axios";

// API 베이스 URL - 환경에 따라 변경 필요
const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 유저 생성
export const createUser = async (nickname) => {
  try {
    const response = await api.post("/users/", { nickname });
    return response.data;
  } catch (error) {
    console.error("Failed to create user:", error);
    throw error;
  }
};

// 유저 정보 조회
export const getUser = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to get user:", error);
    throw error;
  }
};

// 낚시하기
export const fishing = async (userId, habitat) => {
  try {
    const response = await api.post("/game/fish", null, {
      params: {
        user_id: userId,
        habitat: habitat,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fish:", error);
    throw error;
  }
};

// 행동 처리 (판매/방생/수족관)
export const handleAction = async (userId, speciesId, action) => {
  try {
    const response = await api.post("/game/action", {
      user_id: userId,
      species_id: speciesId,
      action: action, // "SELL", "RELEASE", "AQUARIUM"
    });
    return response.data;
  } catch (error) {
    console.error("Failed to handle action:", error);
    throw error;
  }
};

// 도감 조회
export const getCollection = async (userId) => {
  try {
    const response = await api.get(`/game/collection/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to get collection:", error);
    throw error;
  }
};

// 마지막 낚시 무효화 (실패 시)
export const invalidateLastFish = async (userId) => {
  try {
    const response = await api.post("/game/invalidate-last-fish", null, {
      params: {
        user_id: userId,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to invalidate last fish:", error);
    throw error;
  }
};

export default api;
