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
    // displaySelectedData();
  };

  const sendDataToMemberstack = async () => {
    const storedData = JSON.parse(localStorage.getItem("surveyData"));
    if (JSON.stringify(storedData) !== lastSyncedData) {
      // console.log("Syncing Data to Memberstack:", storedData);
      if (storedData) {
        await memberstack.updateMemberJSON({ json: storedData });
        lastSyncedData = JSON.stringify(storedData);
      }
    } else {
      // console.log("No changes in data; skipping sync.");
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
      const attrValue = wrapper.getAttribute("data-clone-wrapper");
      // console.log(attrValue);

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "childList") {
            const addedNodes = Array.from(mutation.addedNodes);
            const removedNodes = Array.from(mutation.removedNodes);

            if (addedNodes.length > 0) {
              console.log("Dodano nowe elementy:", addedNodes);
              addedNodes.forEach((node) => {
                const parent = node.parentNode;
                console.log(parent);
                const siblingCount = parent.children.length;
                console.log(siblingCount);
                const currentIndex = siblingCount - 1;

                const removeButton = node.querySelector(
                  '[data-form="remove-clone"]'
                );
                removeButton.addEventListener("click", () => {
                  console.log("Remove CLONE button clicked");
                  const existingData =
                    JSON.parse(localStorage.getItem("surveyData")) || {};
                  const arr = existingData[attrValue] || [];
                  arr.splice(currentIndex, 1);
                  saveToLocalStorage(attrValue, arr);
                  node.remove();
                });

                const inputs = node.querySelectorAll("input");
                console.log(inputs);
                inputs.forEach((input) => {
                  input.addEventListener("input", () => {
                    console.log("Input NODE Changed:", input.name, input.value);
                    const existingData =
                      JSON.parse(localStorage.getItem("surveyData")) || {};
                    const arr = existingData[attrValue] || [];
                    console.log(arr);

                    arr[currentIndex] = {
                      ...arr[currentIndex],
                      [input.name]: input.value,
                    };

                    saveToLocalStorage(attrValue, arr);
                  });
                });
              });
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
    dataCloneWrappers.forEach((wrapper) => {
      const attrValue = wrapper.getAttribute("data-clone-wrapper");
      nestedSteps.push(attrValue);

      const addNewButton = form.querySelector(`[data-add-new="${attrValue}"]`);
      const removeButton = wrapper.querySelector('[data-form="remove-clone"]');

      addNewButton.addEventListener("click", () => {
        console.log("Add new button clicked", attrValue);
      });

      // removeButton.addEventListener("click", () => {
      //   console.log("Remove button clicked", attrValue);
      //   const existingData =
      //     JSON.parse(localStorage.getItem("surveyData")) || {};
      //   const arr = existingData[attrValue] || [];
      //   arr.splice(0, 1);
      //   saveToLocalStorage(attrValue, arr);
      // });
    });

    const removeButtons = form.querySelectorAll('[data-form="remove-clone"]');
    removeButtons.forEach((button) => {
      const clone = button.parentElement.parentElement.parentElement;
      const attrValue = clone.getAttribute("data-clone");

      button.addEventListener("click", () => {
        console.log("Remove NORMAL button clicked");
        const existingData =
          JSON.parse(localStorage.getItem("surveyData")) || {};
        const arr = existingData[attrValue] || [];
        arr.splice(0, 1);
        saveToLocalStorage(attrValue, arr);
        clone.remove();
      });
    });

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
      } else {
        input.addEventListener("input", () => {
          console.log("Input Changed:", input.name, input.value);
          const existingData =
            JSON.parse(localStorage.getItem("surveyData")) || {};
          const arr = existingData[parent2LevelsUpAttrValue] || [];
          console.log(arr);
          arr[0] = { ...arr[0], [input.name]: input.value };
          saveToLocalStorage(parent2LevelsUpAttrValue, arr);
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
      } else {
        select.addEventListener("input", () => {
          console.log("Select Changed:", select.name, select.value);
          const existingData =
            JSON.parse(localStorage.getItem("surveyData")) || {};
          const arr = existingData[parent2LevelsUpAttrValue] || [];
          console.log(arr);
          arr[0] = { ...arr[0], [select.name]: select.value };
          saveToLocalStorage(parent2LevelsUpAttrValue, arr);
        });
      }
    });
  };

  console.log("v8");
  await initializeLocalStorage();
  addListeners();
  startDataSync();
});
