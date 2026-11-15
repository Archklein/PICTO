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

const cards = Array.from(document.querySelectorAll(".card"));
const syncCardHeights = () => {
  const expandedCards = new Set(
    cards.filter((card) => card.querySelector(".description.expanded")),
  );

  cards.forEach((card) => {
    card.querySelector(".description")?.classList.remove("expanded");
    card.style.height = "";
    card.style.alignSelf = "";
  });

  const measurements = cards.map((card) => {
    const rect = card.getBoundingClientRect();
    return { card, top: Math.round(rect.top), height: rect.height };
  });

  expandedCards.forEach((card) => {
    card.querySelector(".description").classList.add("expanded");
  });

  const rows = new Map();
  measurements.forEach(({ card, top, height }) => {
    const row = rows.get(top) ?? [];
    row.push({ card, height });
    rows.set(top, row);
  });

  rows.forEach((row) => {
    if (!row.some(({ card }) => expandedCards.has(card))) {
      return;
    }

    const collapsedHeight = Math.max(...row.map(({ height }) => height));
    row.forEach(({ card }) => {
      if (expandedCards.has(card)) {
        card.style.alignSelf = "start";
      } else {
        card.style.height = `${collapsedHeight}px`;
      }
    });
  });
};

cards.forEach((card, index) => {
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
  const refreshCardLayout = () => {
    updateButtonVisibility();
    syncCardHeights();
  };

  new MutationObserver(refreshCardLayout).observe(description, {
    childList: true,
    characterData: true,
    subtree: true,
  });
  window.addEventListener("resize", refreshCardLayout);
  document.fonts.ready.then(refreshCardLayout);

  button.addEventListener("click", () => {
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    description.classList.toggle("expanded", !expanded);
    button.textContent = expanded ? "See more" : "See less";
    syncCardHeights();
  });
});
