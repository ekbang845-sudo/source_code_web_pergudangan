export const startGlobalLoading = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("start-global-loading"));
  }
};

export const stopGlobalLoading = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("stop-global-loading"));
  }
};