console.log("end of life survey");

document.addEventListener("DOMContentLoaded", async function () {
  const memberstack = window.$memberstackDom;

  const displaySelectedData = () => {
    console.log("display selected data");
    //w--redirected-checked
    const existingData = JSON.parse(localStorage.getItem("surveyData")) || {};

    const radioInputs = document.querySelectorAll(".w-form-formradioinput");
    console.log(radioInputs);
    radioInputs.forEach((input) => {
      if (existingData[input.name] === input.value) {
        console.log("exist");
        input.classList.add("w--redirected-checked");
      } else {
        input.classList.remove("w--redirected-checked");
      }
    });
  };

  // Keeps track of the last synced data
  let lastSyncedData = null;

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
    const form = document.getElementById("End-of-life-survey-1-SK");

    // Handle back button clicks
    const backButtons = document.querySelectorAll('[data-form="back-btn"]');
    backButtons.forEach((button) => {
      button.addEventListener("click", () => {
        console.log("Back button clicked");
      });
    });

    // Handle input changes
    const inputs = form.querySelectorAll("input");
    inputs.forEach((input) => {
      input.addEventListener("change", () => {
        console.log("Input Changed:", input.name, input.value);

        saveToLocalStorage(input.name, input.value);
      });
    });
  };

  // Initialize, start syncing, and handle unload
  await initializeLocalStorage();
  addListeners();
  startDataSync();
  window.addEventListener("beforeunload", handleBeforeUnload);
});
