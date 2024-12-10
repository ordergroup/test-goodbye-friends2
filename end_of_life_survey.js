console.log("enf of life survey");
document.addEventListener("DOMContentLoaded", async function () {
  const memberstack = window.$memberstackDom;
  console.log("here");

  const addListener = async () => {
    const form = document.getElementById("End-of-life-survey-1-SK");

    const memberJson = await memberstack.getMemberJSON();

    console.log(form);

    //get all inputs in form and listen for changes
    const inputs = form.querySelectorAll("input");
    console.log(inputs);
    inputs.forEach((input) => {
      input.addEventListener("change", async () => {
        // const memberJson = await memberstack.getMemberJSON();
        console.log(input.name, input.value);
        // const updatedData = {
        //   ...memberJson.data,
        //   [input.name]: input.value,
        // };

        // await memberstack.updateMemberJSON({ json: updatedData });
      });
    });
  };

  addListener();
});
