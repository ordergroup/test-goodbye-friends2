document.addEventListener("DOMContentLoaded", async () => {
  await initializeLocalStorage();
  addListeners();
  observeClonedElements(); // Monitorowanie dodawanych elementów
  startDataSync();
});

// Inicjalizacja localStorage
const initializeLocalStorage = async () => {
  const existingData = localStorage.getItem("surveyData");
  if (!existingData) {
    localStorage.setItem("surveyData", JSON.stringify({}));
  }
};

// Funkcja zapisu danych do localStorage
const saveToLocalStorage = (name, value) => {
  const existingData = JSON.parse(localStorage.getItem("surveyData")) || {};
  existingData[name] = value;
  localStorage.setItem("surveyData", JSON.stringify(existingData));
  console.log("Zapisano do localStorage:", existingData);
};

// Dodanie nasłuchiwania dla istniejących inputów
const addListeners = () => {
  const form = document.querySelector("form");

  form.addEventListener("input", (event) => {
    const input = event.target;
    if (input.closest('[data-clone="child"]')) {
      saveToLocalStorage(input.name, input.value);
    }
  });

  form.addEventListener("click", (event) => {
    if (event.target.closest("[data-form='remove-clone']")) {
      const wrapper = event.target.closest("[data-clone='child']");
      if (wrapper) {
        console.log("Element usunięty:", wrapper);

        // Usuń dane z localStorage
        const inputs = wrapper.querySelectorAll("input, select");
        const existingData =
          JSON.parse(localStorage.getItem("surveyData")) || {};

        inputs.forEach((input) => {
          delete existingData[input.name];
        });

        localStorage.setItem("surveyData", JSON.stringify(existingData));
        console.log("Zaktualizowane localStorage po usunięciu:", existingData);

        // Usuń element z DOM
        wrapper.remove();
      }
    }
  });
};

// Obserwacja nowych elementów w DOM
const observeClonedElements = () => {
  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.matches('[data-clone="child"]')) {
            console.log("Nowy element dodany:", node);

            // Dodaj listener dla inputów w nowym elemencie
            const inputs = node.querySelectorAll("input, select");
            inputs.forEach((input) => {
              input.addEventListener("input", () => {
                console.log("Input Changed:", input.name, input.value);
                saveToLocalStorage(input.name, input.value);
              });
            });
          }
        });
      }
    }
  });

  const targetNode = document.querySelector("[data-clone-wrapper]");
  if (targetNode) {
    observer.observe(targetNode, { childList: true, subtree: true });
    console.log("MutationObserver uruchomiony");
  } else {
    console.warn("Nie znaleziono głównego wrappera do obserwacji.");
  }
};

// Synchronizacja danych (opcjonalna funkcja)
const startDataSync = () => {
  console.log("Synchronizacja danych uruchomiona.");
  // Tu możesz dodać synchronizację np. z API lub Memberstack
};
