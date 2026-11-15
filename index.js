const navtop = document.querySelector(".navtop");

if (navtop) {
  const updateNavtopHeight = () => {
    document.documentElement.style.setProperty(
      "--navtop-height",
      `${navtop.getBoundingClientRect().height}px`,
    );
  };

  updateNavtopHeight();
  new ResizeObserver(updateNavtopHeight).observe(navtop);
}

document.querySelectorAll(".card").forEach((card, index) => {
  const description = card.querySelector(".description");
  const button = card.querySelector(".description_toggle");

  if (!button) {
    return;
  }

  if (!description) {
    button.hidden = true;
    return;
  }

  const descriptionId = `card-${index + 1}-description`;
  description.id = descriptionId;
  button.setAttribute("aria-controls", descriptionId);

  const updateButtonVisibility = () => {
    const expanded = description.classList.contains("expanded");
    description.classList.remove("expanded");

    const canExpand =
      Boolean(description.textContent.trim()) &&
      description.scrollHeight > description.clientHeight;

    description.classList.toggle("expanded", expanded && canExpand);
    button.hidden = !canExpand;

    if (!canExpand) {
      button.setAttribute("aria-expanded", "false");
      button.textContent = "See more";
    }
  };

  updateButtonVisibility();
  new MutationObserver(updateButtonVisibility).observe(description, {
    childList: true,
    characterData: true,
    subtree: true,
  });
  window.addEventListener("resize", updateButtonVisibility);
  document.fonts.ready.then(updateButtonVisibility);

  button.addEventListener("click", () => {
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    description.classList.toggle("expanded", !expanded);
    button.textContent = expanded ? "See more" : "See less";
  });
});
