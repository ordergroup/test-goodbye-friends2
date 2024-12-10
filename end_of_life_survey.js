console.log("end of life survey");

document.addEventListener("DOMContentLoaded", function () {
  const memberstack = window.$memberstackDom;

  const saveToLocalStorage = (key, value) => {
    const existingData = JSON.parse(localStorage.getItem("surveyData")) || {};
    const updatedData = { ...existingData, [key]: value };
    localStorage.setItem("surveyData", JSON.stringify(updatedData));
  };

  const sendDataToMemberstack = async () => {
    const storedData = JSON.parse(localStorage.getItem("surveyData"));
    if (storedData) {
      const memberJson = await memberstack.getMemberJSON();
      const updatedData = { ...memberJson.data, ...storedData };
      await memberstack.updateMemberJSON({ json: updatedData });
      console.log("Data sent to Memberstack:", updatedData);
    }
  };

  const addListener = () => {
    const form = document.getElementById("End-of-life-survey-1-SK");

    const backButtons = document.querySelectorAll('[data-form="back-btn"]');
    console.log(backButtons);
    backButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const currentStep =
          JSON.parse(localStorage.getItem("surveyData"))?.currentStep || 1;
        saveToLocalStorage("currentStep", Math.max(currentStep - 1, 1));
      });
    });

    const inputs = form.querySelectorAll("input");
    inputs.forEach((input) => {
      input.addEventListener("change", () => {
        console.log(input.name, input.value);

        saveToLocalStorage(input.name, input.value);

        const currentStep =
          JSON.parse(localStorage.getItem("surveyData"))?.currentStep || 1;
        saveToLocalStorage("currentStep", currentStep + 1);
      });
    });
  };

  // Send data to Memberstack when the user exits or refreshes the page
  window.addEventListener("beforeunload", sendDataToMemberstack);

  addListener();
});
