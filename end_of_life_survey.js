console.log("end of life survey");

document.addEventListener("DOMContentLoaded", async function () {
  const memberstack = window.$memberstackDom;
  const form = document.getElementById("End-of-life-survey-1-SK");
  let lastSyncedData = null;

  const displaySelectedData = () => {
    const existingData = JSON.parse(localStorage.getItem("surveyData")) || {};

    const radioInputs = form.querySelectorAll("input[type=radio]");
    radioInputs.forEach((radioInput) => {
      const closestDiv = radioInput.previousElementSibling;
      if (existingData[radioInput.name] === radioInput.value) {
        closestDiv.classList.add("w--redirected-checked");
      } else {
        closestDiv.classList.remove("w--redirected-checked");
      }
    });

    const textInputs = form.querySelectorAll("input[type=text]");
    textInputs.forEach((textInput) => {
      textInput.value = existingData[textInput.name] || "";
    });

    const select = form.querySelectorAll("select");
    select.forEach((select) => {
      if (existingData[select.name]) select.value = existingData[select.name];
    });
  };

  const initializeLocalStorage = async () => {
    const memberJson = (await memberstack.getMemberJSON()) || {};
    localStorage.setItem("surveyData", JSON.stringify(memberJson.data));
    console.log("Initialized Local Storage:", memberJson.data);

    lastSyncedData = JSON.stringify(memberJson.data);
    displaySelectedData();
  };

  const saveToLocalStorage = (key, value) => {
    const existingData = JSON.parse(localStorage.getItem("surveyData")) || {};
    const updatedData = { ...existingData, [key]: value };

    localStorage.setItem("surveyData", JSON.stringify(updatedData));
    console.log("Updated Local Storage:", updatedData);
    displaySelectedData();
  };

  const sendDataToMemberstack = async () => {
    const storedData = JSON.parse(localStorage.getItem("surveyData"));
    if (JSON.stringify(storedData) !== lastSyncedData) {
      console.log("Syncing Data to Memberstack:", storedData);
      if (storedData) {
        await memberstack.updateMemberJSON({ json: storedData });
        lastSyncedData = JSON.stringify(storedData);
      }
    } else {
      console.log("No changes in data; skipping sync.");
    }
  };

  const startDataSync = () => {
    setInterval(async () => {
      await sendDataToMemberstack();
    }, 5000);
  };

  // Funkcja, która nasłuchuje zmiany w data-clone-wrapper
  function observeCloneWrapper(wrapperSelector) {
    // Znajdź wszystkie wrappery z atrybutem data-clone-wrapper
    const wrappers = document.querySelectorAll(wrapperSelector);

    wrappers.forEach((wrapper) => {
      // Stwórz obserwatora
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "childList") {
            const addedNodes = Array.from(mutation.addedNodes);
            const removedNodes = Array.from(mutation.removedNodes);

            if (addedNodes.length > 0) {
              console.log("Dodano nowe elementy:", addedNodes);
            }
            if (removedNodes.length > 0) {
              console.log("Usunięto elementy:", removedNodes);
            }
          }
        });
      });

      // Konfiguracja obserwatora
      observer.observe(wrapper, {
        childList: true, // Obserwuj zmiany w dzieciach
        subtree: false, // Nie schodź w głąb kolejnych poziomów
      });

      console.log("Obserwuję zmiany w:", wrapper);
    });
  }

  observeCloneWrapper("[data-clone-wrapper]");

  const addListeners = () => {
    const backButtons = form.querySelectorAll('[data-form="back-btn"]');
    backButtons.forEach((button) => {
      button.addEventListener("click", () => {
        console.log("Back button clicked");
        displaySelectedData();
      });
    });

    const nestedSteps = [];

    const dataCloneWrappers = form.querySelectorAll("[data-clone-wrapper]");
    dataCloneWrappers.forEach((element) => {
      const attrValue = element.getAttribute("data-clone-wrapper");
      console.log("wrapper", attrValue, element);
    });

    const dataAddNewButtons = form.querySelectorAll("[data-add-new]");
    dataAddNewButtons.forEach((button) => {
      const attrValue = button.getAttribute("data-add-new");
      nestedSteps.push(attrValue);
      button.addEventListener("click", () => {
        console.log("button", attrValue, button);
        const wrapper = form.querySelector(
          `[data-clone-wrapper="${attrValue}"]`
        );
        console.log(wrapper);
        const clones = wrapper.querySelectorAll("[data-clone]");
        console.log({ clones });
        clones.forEach((clone, index) => {
          const inputs = clone.querySelectorAll("input");
          console.log(inputs);
          inputs.forEach((input) => {
            input.addEventListener("input", () => {
              console.log("Input Changed:", input.name, input.value);
              const existingData =
                JSON.parse(localStorage.getItem("surveyData")) || {};
              const arr = existingData[attrValue] || [];
              console.log(arr);
              arr[index] = { ...arr[index], [input.name]: input.value };
              saveToLocalStorage(attrValue, arr);
            });
          });
        });
      });
    });

    console.log(nestedSteps);

    // Create an observer instance
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        console.log(mutation);
      }
    });
    const config = { childList: true, subtree: true };
    observer.observe(form, config);

    // type radio and text
    const inputs = form.querySelectorAll("input");
    inputs.forEach((input) => {
      const parent2LevelsUp = input.parentElement.parentElement;
      const parent2LevelsUpAttrValue =
        parent2LevelsUp.getAttribute("data-clone");
      if (!nestedSteps.includes(parent2LevelsUpAttrValue)) {
        input.addEventListener("input", () => {
          console.log("Input Changed:", input.name, input.value);
          saveToLocalStorage(input.name, input.value);
        });
      }
    });

    // type select
    const selects = form.querySelectorAll("select");
    selects.forEach((select) => {
      const parent2LevelsUp = select.parentElement.parentElement;
      const parent2LevelsUpAttrValue =
        parent2LevelsUp.getAttribute("data-clone");
      if (!nestedSteps.includes(parent2LevelsUpAttrValue)) {
        select.addEventListener("input", () => {
          console.log("Select Changed:", select.name, select.value);
          saveToLocalStorage(select.name, select.value);
        });
      }
    });
  };
  console.log("v8");
  await initializeLocalStorage();
  addListeners();
  startDataSync();
});
