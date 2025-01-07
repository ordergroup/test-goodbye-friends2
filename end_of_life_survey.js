console.log("end of life survey");

document.addEventListener("DOMContentLoaded", async function () {
  const memberstack = window.$memberstackDom;
  const form = document.getElementById("End-of-life-survey-1-SK");
  let lastSyncedData = null;

  const displaySelectedData = () => {
    const existingData = JSON.parse(localStorage.getItem("surveyData")) || {};

    const nestedSteps = [];

    const displayNestedData = () => {
      const dataCloneWrappers = form.querySelectorAll("[data-clones-wrapper]");
      dataCloneWrappers.forEach((wrapper) => {
        //we need to create clones and append them based on the data and then display data in clones and we need to add listeners to the clones (remove buttons, inputs, selects)
        const attrValue = wrapper.getAttribute("data-clones-wrapper");
        nestedSteps.push(attrValue);

        const existingData =
          JSON.parse(localStorage.getItem("surveyData")) || {};
        const arr = existingData[attrValue] || [];

        arr.forEach((data, index) => {
          if (index === 0) {
            const inputs = wrapper.querySelectorAll("input");
            inputs.forEach((input) => {
              if (data[input.name]) input.value = data[input.name];
            });

            const selects = wrapper.querySelectorAll("select");
            selects.forEach((select) => {
              if (data[select.name]) select.value = data[select.name];
            });
          } else {
            const clone = wrapper
              .querySelector("[data-clones]")
              .cloneNode(true);
            wrapper.appendChild(clone);

            const inputs = clone.querySelectorAll("input");
            inputs.forEach((input) => {
              if (data[input.name]) input.value = data[input.name];
              // input.addEventListener("input", () => {
              //   console.log("Input NODE Changed:", input.name, input.value);
              //   const existingData =
              //     JSON.parse(localStorage.getItem("surveyData")) || {};
              //   const arr = existingData[attrValue] || [];
              //   console.log({ index });

              //   arr[index] = { ...arr[index], [input.name]: input.value };

              //   saveToLocalStorage(attrValue, arr);
              // });
            });

            const selects = clone.querySelectorAll("select");
            selects.forEach((select) => {
              if (data[select.name]) select.value = data[select.name];
              // select.addEventListener("input", () => {
              //   console.log("Select NODE Changed:", select.name, select.value);
              //   const existingData =
              //     JSON.parse(localStorage.getItem("surveyData")) || {};
              //   const arr = existingData[attrValue] || [];
              //   console.log(arr);

              //   arr[index] = { ...arr[index], [select.name]: select.value };

              //   saveToLocalStorage(attrValue, arr);
              // });
            });

            // const removeButton = clone.querySelector(
            //   '[data-form="remove-clone"]'
            // );
            // removeButton.addEventListener("click", () => {
            //   if (wrapper.children.length === 1) return;
            //   console.log("Remove CLONE button clicked");
            //   removeItem(attrValue, index, clone);
            // });
          }
        });
      });
    };

    displayNestedData();

    const displayFlatData = () => {
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
        const parent2LevelsUp = textInput.parentElement.parentElement;
        const parent2LevelsUpAttrValue =
          parent2LevelsUp.getAttribute("data-clones");

        if (!nestedSteps.includes(parent2LevelsUpAttrValue)) {
          if (existingData[textInput.name])
            textInput.value = existingData[textInput.name];
        }
      });

      const selects = form.querySelectorAll("selects");
      selects.forEach((select) => {
        const parent2LevelsUp = select.parentElement.parentElement;
        const parent2LevelsUpAttrValue =
          parent2LevelsUp.getAttribute("data-clones");

        if (!nestedSteps.includes(parent2LevelsUpAttrValue)) {
          if (existingData[select.name])
            select.value = existingData[select.name];
        }
      });
    };

    displayFlatData();
  };

  const initializeLocalStorage = async () => {
    const memberJson = (await memberstack.getMemberJSON()) || {};
    localStorage.setItem("surveyData", JSON.stringify(memberJson.data));
    console.log("Initialized Local Storage:", memberJson.data);

    lastSyncedData = JSON.stringify(memberJson.data);
    // displaySelectedData();
  };

  const saveToLocalStorage = (key, value) => {
    const existingData = JSON.parse(localStorage.getItem("surveyData")) || {};
    const updatedData = { ...existingData, [key]: value };

    localStorage.setItem("surveyData", JSON.stringify(updatedData));
    console.log("Updated Local Storage:", updatedData);
    // displaySelectedData();
  };

  const sendDataToMemberstack = async () => {
    const storedData = JSON.parse(localStorage.getItem("surveyData"));
    if (JSON.stringify(storedData) !== lastSyncedData) {
      // console.log("Syncing Data to Memberstack:", storedData);
      if (storedData) {
        await memberstack.updateMemberJSON({ json: storedData });
        lastSyncedData = JSON.stringify(storedData);
      }
    } else {
      // console.log("No changes in data; skipping sync.");
    }
  };

  const startDataSync = () => {
    setInterval(async () => {
      await sendDataToMemberstack();
    }, 5000);
  };

  const addListeners = () => {
    const form = document.getElementById("End-of-life-survey-1-SK");

    const nestedSteps = [];

    const removeItem = (attrValue, indexToRemove, element) => {
      const existingData = JSON.parse(localStorage.getItem("surveyData")) || {};
      const arr = existingData[attrValue] || [];
      arr.splice(indexToRemove, 1);
      saveToLocalStorage(attrValue, arr);
      element.remove();

      addListeners();
    };

    const dataCloneWrappers = form.querySelectorAll("[data-clones-wrapper]");
    dataCloneWrappers.forEach((wrapper) => {
      const attrValue = wrapper.getAttribute("data-clones-wrapper");
      nestedSteps.push(attrValue);

      const addNewButton = form.querySelector(`[data-add-news="${attrValue}"]`);

      addNewButton.addEventListener("click", () => {
        const clone = wrapper.querySelector("[data-clones]").cloneNode(true);
        wrapper.appendChild(clone);
        addListeners();

        // const inputs = clone.querySelectorAll("input");
        // inputs.forEach((input) => {
        //   input.value = "";
        //   input.addEventListener("input", () => {
        //     const indexOfClone = Array.from(wrapper.children).indexOf(clone);
        //     console.log({ indexOfClone });
        //     console.log("Input NODE Changed:", input.name, input.value);
        //     const existingData =
        //       JSON.parse(localStorage.getItem("surveyData")) || {};
        //     const arr = existingData[attrValue] || [];
        //     console.log(arr);

        //     arr[indexOfClone] = {
        //       ...arr[indexOfClone],
        //       [input.name]: input.value,
        //     };

        //     saveToLocalStorage(attrValue, arr);
        //   });
        // });

        // const selects = clone.querySelectorAll("select");
        // selects.forEach((select) => {
        //   select.value = "";
        //   select.addEventListener("input", () => {
        //     const indexOfClone = Array.from(wrapper.children).indexOf(clone);
        //     console.log({ indexOfClone });
        //     console.log("Select NODE Changed:", select.name, select.value);
        //     const existingData =
        //       JSON.parse(localStorage.getItem("surveyData")) || {};
        //     const arr = existingData[attrValue] || [];
        //     console.log(arr);

        //     arr[indexOfClone] = {
        //       ...arr[indexOfClone],
        //       [select.name]: select.value,
        //     };

        //     saveToLocalStorage(attrValue, arr);
        //   });
        // });

        // const removeButton = clone.querySelector('[data-form="remove-clone"]');
        // removeButton.addEventListener("click", () => {
        //   if (wrapper.children.length === 1) return;
        //   console.log("Remove CLONE button clicked");
        //   const indexOfClone = Array.from(wrapper.children).indexOf(clone);
        //   removeItem(attrValue, indexOfClone, clone);
        // });
      });
    });

    const removeButtons = form.querySelectorAll('[data-form="remove-clone"]');
    removeButtons.forEach((button) => {
      const wrapper = button.parentElement.parentElement.parentElement;
      const indexOfClone = Array.from(wrapper.children).indexOf(
        button.parentElement
      );
      const element = button.parentElement.parentElement.parentElement;
      const attrValue = element.getAttribute("data-clones");

      button.addEventListener("click", () => {
        if (removeButtons.length === 1) return;
        console.log("Remove NORMAL button clicked");
        removeItem(attrValue, indexOfClone, element);
      });
    });

    // if step is nested we save data to array instead of object
    // type radio and text
    const inputs = form.querySelectorAll("input");
    inputs.forEach((input) => {
      const wrapper = input.parentElement.parentElement.parentElement;
      const parent2LevelsUp = input.parentElement.parentElement;
      const parent2LevelsUpAttrValue =
        parent2LevelsUp.getAttribute("data-clones");
      const indexOfClone = Array.from(wrapper.children).indexOf(
        parent2LevelsUp
      );
      if (!nestedSteps.includes(parent2LevelsUpAttrValue)) {
        input.addEventListener("input", () => {
          console.log("Input Changed:", input.name, input.value);
          saveToLocalStorage(input.name, input.value);
        });
      } else {
        input.addEventListener("input", () => {
          console.log("Input Changed:", input.name, input.value);
          const existingData =
            JSON.parse(localStorage.getItem("surveyData")) || {};
          const arr = existingData[parent2LevelsUpAttrValue] || [];
          console.log(arr);
          arr[indexOfClone] = {
            ...arr[indexOfClone],
            [input.name]: input.value,
          };
          saveToLocalStorage(parent2LevelsUpAttrValue, arr);
        });
      }
    });

    // type select
    const selects = form.querySelectorAll("select");
    selects.forEach((select) => {
      const wrapper = select.parentElement.parentElement.parentElement;
      const indexOfClone = Array.from(wrapper.children).indexOf(
        select.parentElement
      );
      const parent2LevelsUp = select.parentElement.parentElement;
      const parent2LevelsUpAttrValue =
        parent2LevelsUp.getAttribute("data-clones");
      if (!nestedSteps.includes(parent2LevelsUpAttrValue)) {
        select.addEventListener("input", () => {
          console.log("Select Changed:", select.name, select.value);
          saveToLocalStorage(select.name, select.value);
        });
      } else {
        select.addEventListener("input", () => {
          console.log("Select Changed:", select.name, select.value);
          const existingData =
            JSON.parse(localStorage.getItem("surveyData")) || {};
          const arr = existingData[parent2LevelsUpAttrValue] || [];
          console.log(arr);
          arr[indexOfClone] = {
            ...arr[indexOfClone],
            [select.name]: select.value,
          };
          saveToLocalStorage(parent2LevelsUpAttrValue, arr);
        });
      }
    });
  };

  console.log("v23");
  await initializeLocalStorage();
  displaySelectedData();
  addListeners();
  startDataSync();
});
