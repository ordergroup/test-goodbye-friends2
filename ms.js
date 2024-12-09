document.addEventListener("DOMContentLoaded", async function () {
  const memberstack = window.$memberstackDom;

  const displayData = async () => {
    memberstack.getCurrentMember().then(async ({ data: member }) => {
      console.log({ member });
      if (member) {
        const memberJson = await memberstack.getMemberJSON(member.id);
        console.log(memberJson);

        const dataElements = document.querySelectorAll("[ms-data-json]");

        dataElements.forEach((element) => {
          const key = element.getAttribute("ms-data-json");
          element.textContent = memberJson.data[key];
        });
      }
    });
  };
  displayData();

  const addListener = async () => {
    const singleButton = document.getElementById("ms-single-btn");
    const buttonBack = document.getElementById("ms-back-btn");
    const yesButton = document.getElementById("ms-yes-btn");

    const memberJson = await memberstack.getMemberJSON();

    const containers = document.querySelectorAll("[ms-step-container]");
    containers.forEach((container) => {
      const step = container.getAttribute("ms-step-container");
      console.log(step, typeof step, typeof memberJson.data.currentStep);
      container.style.display = "none";
      if (memberJson.data.currentStep == step) {
        container.style.display = "block";
      }
    });

    singleButton.addEventListener("click", async () => {
      const memberJson = await memberstack.getMemberJSON();

      const updatedData = {
        ...memberJson.data,
        maritalStatus: "single",
        currentStep: memberJson.data.currentStep + 1,
      };

      await memberstack.updateMemberJSON({ json: updatedData });
    });

    buttonBack.addEventListener("click", async () => {
      const memberJson = await memberstack.getMemberJSON();

      const updatedData = {
        ...memberJson.data,
        currentStep: memberJson.data.currentStep - 1,
      };

      await memberstack.updateMemberJSON({ json: updatedData });
    });

    yesButton.addEventListener("click", async () => {
      const memberJson = await memberstack.getMemberJSON();

      const updatedData = {
        ...memberJson.data,
        hasChildren: true,
        currentStep: memberJson.data.currentStep + 1,
      };

      await memberstack.updateMemberJSON({ json: updatedData });
    });
  };

  addListener();
});
