export type ToastDetail = {
  message: string;
  type: "success" | "error";
};

export const triggerToast = (message: string, type: "success" | "error") => {
  const event = new CustomEvent<ToastDetail>("show-toast", {
    detail: { message, type },
  });
  window.dispatchEvent(event);
};