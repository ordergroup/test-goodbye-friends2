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

  const addListeners = () => {
    const backButtons = form.querySelectorAll('[data-form="back-btn"]');
    backButtons.forEach((button) => {
      button.addEventListener("click", () => {
        console.log("Back button clicked");
        displaySelectedData();
      });
    });

    // type radio and text
    const inputs = form.querySelectorAll("input");
    inputs.forEach((input) => {
      input.addEventListener("input", () => {
        console.log("Input Changed:", input.name, input.value);
        saveToLocalStorage(input.name, input.value);
      });
    });

    // type select
    const selects = form.querySelectorAll("select");
    selects.forEach((select) => {
      select.addEventListener("input", () => {
        console.log("Select Changed:", select.name, select.value);
        saveToLocalStorage(select.name, select.value);
      });
    });

    const dataCloneWrappers = form.querySelectorAll("[data-clone-wrapper]");
    dataCloneWrappers.forEach((element) => {
      const attrValue = element.getAttribute("data-clone-wrapper");
      console.log("wrapper", attrValue, element);
    });

    const dataAddNewButtons = form.querySelectorAll("[data-add-new]");
    dataAddNewButtons.forEach((button) => {
      const attrValue = button.getAttribute("data-add-new");
      console.log("button", attrValue, button);
      button.addEventListener("click", () => {
        console.log("Clone Elements Button Clicked");
        const wrapper = form.querySelector(
          `[data-clone-wrapper="${attrValue}"]`
        );
        const clones = wrapper.querySelectorAll("[data-clone]");
        clones.forEach((clone, index) => {
          const inputs = clone.querySelectorAll("input");
          inputs.forEach((input) => {
            input.addEventListener("input", () => {
              console.log("Input Changed:", input.name, input.value);
              const existingData =
                JSON.parse(localStorage.getItem("surveyData")) || {};
              const arr = existingData[attrValue] || [];
              arr[index] = { ...arr[index], [input.name]: input.value };
              saveToLocalStorage(attrValue, arr);
            });
          });
        });
      });
    });
  };
  console.log("v3");
  await initializeLocalStorage();
  addListeners();
  startDataSync();
});
