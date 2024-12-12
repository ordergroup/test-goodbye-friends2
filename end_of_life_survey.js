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
      select.value = existingData[select.name] || "";
    });

    console.log(select);
  };

  // Get initial member data and populate localStorage
  const initializeLocalStorage = async () => {
    const memberJson = (await memberstack.getMemberJSON()) || {};
    localStorage.setItem("surveyData", JSON.stringify(memberJson.data));
    console.log("Initialized Local Storage:", memberJson.data);

    lastSyncedData = JSON.stringify(memberJson.data);
    displaySelectedData();
  };

  // Save data to localStorage
  const saveToLocalStorage = (key, value) => {
    const existingData = JSON.parse(localStorage.getItem("surveyData")) || {};
    const updatedData = { ...existingData, [key]: value };

    localStorage.setItem("surveyData", JSON.stringify(updatedData));
    console.log("Updated Local Storage:", updatedData);
    displaySelectedData();
  };

  // Send data to Memberstack if data has changed
  const sendDataToMemberstack = async () => {
    const storedData = JSON.parse(localStorage.getItem("surveyData"));
    if (JSON.stringify(storedData) !== lastSyncedData) {
      console.log("Syncing Data to Memberstack:", storedData);

      if (storedData) {
        await memberstack.updateMemberJSON({ json: storedData });
        console.log("Data sent to Memberstack:", storedData);
        lastSyncedData = JSON.stringify(storedData); // Update last synced state
      }
    } else {
      console.log("No changes in data; skipping sync.");
    }
  };

  // Periodically check and send data to Memberstack if it has changed
  const startDataSync = () => {
    setInterval(async () => {
      await sendDataToMemberstack();
    }, 5000); // Sync every 5 seconds
  };

  // Send data immediately when the user leaves the page
  const handleBeforeUnload = () => {
    sendDataToMemberstack();
    console.log("Data sent before page unload");
  };

  // Add listeners to inputs and back buttons
  const addListeners = () => {
    // Handle back button clicks
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
      input.addEventListener("change", () => {
        console.log("Input Changed:", input.name, input.value);

        saveToLocalStorage(input.name, input.value);
      });
    });

    // type select
    const selects = form.querySelectorAll("select");
    selects.forEach((select) => {
      select.addEventListener("change", () => {
        console.log("Select Changed:", select.name, select.value);

        saveToLocalStorage(select.name, select.value);
      });
    });
  };

  // Initialize, start syncing, and handle unload
  await initializeLocalStorage();
  addListeners();
  startDataSync();
  window.addEventListener("beforeunload", handleBeforeUnload);
});
