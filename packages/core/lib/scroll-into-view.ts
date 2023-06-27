export const scrollIntoView = (el: HTMLElement) => {
  const oldStyle = { ...el.style };

  el.style.scrollMargin = "256px";

  if (el) {
    el?.scrollIntoView({ behavior: "smooth" });

    el.style.scrollMargin = oldStyle.scrollMargin || "";
  }
};
