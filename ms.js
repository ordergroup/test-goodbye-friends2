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

        const containers = document.querySelectorAll("[ms-step-container]");
        containers.forEach((container) => {
          const step = container.getAttribute("ms-step-container");
          console.log(step, typeof step, typeof memberJson.data.currentStep);
          container.style.display = "none";
          if (memberJson.data.currentStep == step) {
            container.style.display = "block";
          }
        });
      }
    });
  };
  displayData();

  const addListener = async () => {
    const buttonBack = document.getElementById("ms-back-btn");
    const step1buttons = document.querySelectorAll("[ms-step-1-button]");
    const step2buttons = document.querySelectorAll("[ms-step-2-button]");

    const memberJson = await memberstack.getMemberJSON();

    step1buttons.forEach((button) => {
      button.addEventListener("click", async () => {
        const memberJson = await memberstack.getMemberJSON();

        const value = button.getAttribute("ms-step-1-button");
        const updatedData = {
          ...memberJson.data,
          currentStep: memberJson.data.currentStep + 1,
          maritalStatus: value,
        };

        await memberstack.updateMemberJSON({ json: updatedData });
        displayData();
      });
    });

    step2buttons.forEach((button) => {
      button.addEventListener("click", async () => {
        const memberJson = await memberstack.getMemberJSON();

        const value = button.getAttribute("ms-step-2-button");
        const updatedData = {
          ...memberJson.data,
          currentStep: memberJson.data.currentStep + 1,
          hasChildren: value,
        };

        await memberstack.updateMemberJSON({ json: updatedData });
        displayData();
      });
    });

    buttonBack.addEventListener("click", async () => {
      const memberJson = await memberstack.getMemberJSON();

      if (memberJson.data.currentStep <= 1) return;
      const updatedData = {
        ...memberJson.data,
        currentStep: memberJson.data.currentStep - 1,
      };

      await memberstack.updateMemberJSON({ json: updatedData });
      displayData();
    });

    buttonBack.style.backgroundColor =
      memberJson.data.currentStep <= 1 ? "gray" : "white";
  };

  addListener();
});
