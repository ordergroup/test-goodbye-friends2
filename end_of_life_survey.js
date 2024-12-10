console.log("end of life survey");

document.addEventListener("DOMContentLoaded", async function () {
  const memberstack = window.$memberstackDom;

  // Get initial member data and populate localStorage
  const initializeLocalStorage = async () => {
    const memberJson = await memberstack.getMemberJSON();
    console.log("Initial Member Data:", memberJson);

    const storedData = JSON.parse(localStorage.getItem("surveyData")) || {};
    const updatedData = { ...memberJson.data, ...storedData };

    localStorage.setItem("surveyData", JSON.stringify(updatedData));
    console.log("Initialized Local Storage:", updatedData);
  };

  // Save data to localStorage
  const saveToLocalStorage = (key, value) => {
    const existingData = JSON.parse(localStorage.getItem("surveyData")) || {};
    const updatedData = { ...existingData, [key]: value };

    localStorage.setItem("surveyData", JSON.stringify(updatedData));
    console.log("Updated Local Storage:", updatedData);
  };

  // Periodically send data to Memberstack
  const startDataSync = () => {
    setInterval(async () => {
      const storedData = JSON.parse(localStorage.getItem("surveyData"));
      console.log("Syncing Data to Memberstack:", storedData);

      if (storedData) {
        await memberstack.updateMemberJSON({ json: storedData });
        console.log("Data sent to Memberstack:", storedData);
      }
    }, 5000); // Sync every 5 seconds
  };

  // Add listeners to inputs and back buttons
  const addListeners = () => {
    const form = document.getElementById("End-of-life-survey-1-SK");

    // Handle back button clicks
    const backButtons = document.querySelectorAll('[data-form="back-btn"]');
    backButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const existingData =
          JSON.parse(localStorage.getItem("surveyData")) || {};

        const currentStep = existingData?.currentStep || 1;
        saveToLocalStorage("currentStep", Math.max(currentStep - 1, 1));
      });
    });

    // Handle input changes
    const inputs = form.querySelectorAll("input");
    inputs.forEach((input) => {
      input.addEventListener("change", () => {
        console.log("Input Changed:", input.name, input.value);

        saveToLocalStorage(input.name, input.value);

        const existingData =
          JSON.parse(localStorage.getItem("surveyData")) || {};
        saveToLocalStorage("currentStep", (existingData.currentStep || 1) + 1);
      });
    });
  };

  // Initialize and start syncing
  await initializeLocalStorage();
  addListeners();
  startDataSync();
});
