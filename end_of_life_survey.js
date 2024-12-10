console.log("enf of life survey");
document.addEventListener("DOMContentLoaded", async function () {
  const memberstack = window.$memberstackDom;

  const addListener = async () => {
    const form = document.getElementById("End-of-life-survey-1-SK");

    const backButton = document.querySelector('[data-form="back-btn"]');
    console.log(backButton);
    backButton.addEventListener("click", async () => {
      const memberJson = await memberstack.getMemberJSON();
      console.log("BACK BUTTON CLICKED");
      const updatedData = {
        ...memberJson.data,
        currentStep: memberJson.data.currentStep - 1,
      };

      await memberstack.updateMemberJSON({ json: updatedData });
    });

    //get all inputs in form and listen for changes
    const inputs = form.querySelectorAll("input");
    // console.log(inputs);
    inputs.forEach((input) => {
      input.addEventListener("change", async () => {
        const memberJson = await memberstack.getMemberJSON();
        console.log(input.name, input.value);

        const updatedData = {
          ...memberJson.data,
          [input.name]: input.value,
          currentStep: memberJson.data.currentStep + 1,
        };

        await memberstack.updateMemberJSON({ json: updatedData });
      });
    });
  };

  addListener();
});
