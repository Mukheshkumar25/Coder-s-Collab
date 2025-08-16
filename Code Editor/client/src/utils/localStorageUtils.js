// utils/localStorageUtils.js

const WEB_KEY = "codefusion_web_files";
const GENERAL_KEY = "codefusion_general_files";
const MODE_KEY = "codefusion_editor_mode";
const ACTIVE_FILE_WEB = "codefusion_active_web";
const ACTIVE_FILE_GENERAL = "codefusion_active_general";

export const saveToLocalStorage = (mode, files) => {
  const key = mode === "web" ? WEB_KEY : GENERAL_KEY;
  localStorage.setItem(key, JSON.stringify(files));
};

export const loadFromLocalStorage = (mode) => {
  const key = mode === "web" ? WEB_KEY : GENERAL_KEY;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

export const saveEditorMode = (mode) => {
  localStorage.setItem(MODE_KEY, mode);
};

export const loadEditorMode = () => {
  return localStorage.getItem(MODE_KEY) || "general";
};

export const saveActiveFile = (mode, id) => {
  const key = mode === "web" ? ACTIVE_FILE_WEB : ACTIVE_FILE_GENERAL;
  localStorage.setItem(key, id);
};

export const loadActiveFile = (mode) => {
  const key = mode === "web" ? ACTIVE_FILE_WEB : ACTIVE_FILE_GENERAL;
  return localStorage.getItem(key);
};