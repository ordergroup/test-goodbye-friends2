document.addEventListener("DOMContentLoaded", async function () {
  const memberstack = window.$memberstackDom;
  const form = document.getElementById("End-of-life-survey-1-SK");
  let lastSyncedData = null;

  const initializeLocalStorage = async () => {
    const memberJson = (await memberstack.getMemberJSON()) || {};
    localStorage.setItem("surveyData", JSON.stringify(memberJson.data));
    console.log("Initialized Local Storage:", memberJson.data);
    lastSyncedData = JSON.stringify(memberJson.data);
    displaySelectedData();
  };

  const saveToLocalStorage = (wrapperType, index, key, value) => {
    const existingData = JSON.parse(localStorage.getItem("surveyData")) || {};
    existingData[wrapperType] = existingData[wrapperType] || [];

    // Aktualizacja konkretnego obiektu w tablicy
    if (!existingData[wrapperType][index]) {
      existingData[wrapperType][index] = {};
    }
    existingData[wrapperType][index][key] = value;

    localStorage.setItem("surveyData", JSON.stringify(existingData));
    console.log("Updated Local Storage:", existingData);
  };

  const removeFromLocalStorage = (wrapperType, index) => {
    const existingData = JSON.parse(localStorage.getItem("surveyData")) || {};
    if (existingData[wrapperType]) {
      existingData[wrapperType].splice(index, 1);
      localStorage.setItem("surveyData", JSON.stringify(existingData));
      console.log("Removed Item:", existingData);
    }
  };

  const displaySelectedData = () => {
    const existingData = JSON.parse(localStorage.getItem("surveyData")) || {};

    Object.keys(existingData).forEach((wrapperType) => {
      const wrapper = form.querySelector(
        `[data-clone-wrapper="${wrapperType}"]`
      );
      if (wrapper) {
        wrapper.innerHTML = ""; // Wyczyść istniejące elementy
        existingData[wrapperType].forEach((data, index) => {
          addCloneElement(wrapperType, data, index);
        });
      }
    });
  };

  const addCloneElement = (wrapperType, data = {}, index = null) => {
    const wrapper = form.querySelector(`[data-clone-wrapper="${wrapperType}"]`);
    if (!wrapper) return;

    const newElement = wrapper.querySelector("[data-clone]").cloneNode(true);
    newElement.style.display = "block";

    // Wstaw dane do inputów
    const inputs = newElement.querySelectorAll("input, select");
    inputs.forEach((input) => {
      const key = input.getAttribute("name");
      input.value = data[key] || "";
      input.addEventListener("input", () => {
        saveToLocalStorage(wrapperType, index, key, input.value);
      });
    });

    // Obsługa usuwania
    const deleteButton = newElement.querySelector("[data-form='remove-clone']");
    deleteButton.addEventListener("click", () => {
      newElement.remove();
      removeFromLocalStorage(wrapperType, index);
    });

    wrapper.appendChild(newElement);
  };

  const addListeners = () => {
    // Obsługa przycisku Dodaj
    const addButtons = form.querySelectorAll("[data-add-new]");
    addButtons.forEach((button) => {
      const wrapperType = button.getAttribute("data-add-new");
      button.addEventListener("click", () => {
        const wrapper = form.querySelector(
          `[data-clone-wrapper="${wrapperType}"]`
        );
        const existingData =
          JSON.parse(localStorage.getItem("surveyData")) || {};
        existingData[wrapperType] = existingData[wrapperType] || [];

        const newIndex = existingData[wrapperType].length;
        existingData[wrapperType].push({});
        localStorage.setItem("surveyData", JSON.stringify(existingData));

        addCloneElement(wrapperType, {}, newIndex);
        console.log("Added New Clone Element");
      });
    });
  };

  await initializeLocalStorage();
  addListeners();
});
