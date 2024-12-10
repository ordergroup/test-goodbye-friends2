console.log("end of life survey");

document.addEventListener("DOMContentLoaded", async function () {
  const memberstack = window.$memberstackDom;

  const memberJson = await memberstack.getMemberJSON();
  console.log(memberJson);

  const sendDataToMemberstack = async () => {
    const storedData = JSON.parse(localStorage.getItem("surveyData"));
    console.log({ storedData });
    if (storedData) {
      const updatedData = { ...memberJson.data, ...storedData };
      await memberstack.updateMemberJSON({ json: updatedData });
      console.log("Data sent to Memberstack:", updatedData);
    }
  };

  const saveToLocalStorage = (key, value) => {
    const existingData = JSON.parse(localStorage.getItem("surveyData")) || {};
    const updatedData = { ...existingData, [key]: value };
    localStorage.setItem("surveyData", JSON.stringify(updatedData));
    console.log(localStorage.getItem("surveyData"));

    setTimeout(async () => {
      await sendDataToMemberstack();
    }, 1000);
  };

  const addListener = () => {
    const form = document.getElementById("End-of-life-survey-1-SK");

    const backButtons = document.querySelectorAll('[data-form="back-btn"]');
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
