document.addEventListener("DOMContentLoaded", () => {
  const memberstack = window.$memberstackDom; // Poprawny obiekt Memberstack
  let formData = {}; // Obiekt na dane wejściowe
  console.log("v1");

  // Funkcja inicjalizująca dane z localStorage
  const initializeLocalStorage = async () => {
    const memberJson = (await memberstack.getMemberJSON()) || {};
    localStorage.setItem("surveyData", JSON.stringify(memberJson.data));
    console.log("Initialized Local Storage:", memberJson.data);

    displaySelectedData();
  };

  // Funkcja zapisująca dane do localStorage i Memberstack
  const saveData = () => {
    localStorage.setItem("formData", JSON.stringify(formData));
    memberstack.updateMemberJSON(formData).then(() => {
      console.log("Data saved to Memberstack:", formData);
    });
  };

  // Funkcja pobierająca wartości z inputów
  const getInputValues = (element) => {
    const inputs = element.querySelectorAll("input, select");
    const data = {};
    inputs.forEach((input) => {
      if (input.name) {
        data[input.name] = input.value;
      }
    });
    return data;
  };

  // Funkcja aktualizująca dane dla zagnieżdżonych wrapperów
  const updateClonedData = () => {
    const cloneWrappers = document.querySelectorAll("[data-clone-wrapper]");
    cloneWrappers.forEach((wrapper) => {
      const wrapperName = wrapper.getAttribute("data-clone-wrapper"); // np. "child", "property"
      const children = wrapper.querySelectorAll(
        `[data-clone="${wrapperName}"]`
      );

      formData[wrapperName] = []; // Tworzymy tablicę dla każdego wrappera
      children.forEach((child) => {
        const childData = getInputValues(child);
        formData[wrapperName].push(childData);
      });
    });
    saveData();
  };

  // Funkcja aktualizująca główne inputy
  const updateMainInputs = () => {
    formData = getInputValues(document); // Pobierz główne dane z inputów
    updateClonedData(); // Zaktualizuj dane zagnieżdżone
    saveData();
  };

  // Funkcja wyświetlająca dane (displaySelectedData)
  const displaySelectedData = () => {
    const displayArea = document.getElementById("display-area"); // Przykładowy obszar na dane
    if (!displayArea) return;

    displayArea.innerHTML = ""; // Wyczyść obszar wyświetlania

    // Wyświetl główne dane
    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        displayArea.innerHTML += `<h3>${key}:</h3>`;
        value.forEach((item, index) => {
          displayArea.innerHTML += `<h4>${key} ${index + 1}</h4>`;
          Object.entries(item).forEach(([childKey, childValue]) => {
            displayArea.innerHTML += `<p>${childKey}: ${childValue}</p>`;
          });
        });
      } else {
        displayArea.innerHTML += `<p><strong>${key}:</strong> ${value}</p>`;
      }
    });
  };

  // Nasłuchiwanie na zmiany w inputach
  document.addEventListener("input", (event) => {
    if (event.target.closest("[data-clone-wrapper]")) {
      updateClonedData();
    } else {
      updateMainInputs();
    }
    displaySelectedData(); // Aktualizuj wyświetlanie po każdej zmianie
  });

  // Obsługa dodawania i usuwania elementów
  document.body.addEventListener("click", (event) => {
    if (
      event.target.closest("[data-add-new]") ||
      event.target.closest('[data-form="remove-clone"]')
    ) {
      setTimeout(() => {
        updateClonedData();
        displaySelectedData();
      }, 50); // Delay na zakończenie operacji klonowania/usuwania
    }
  });

  // Inicjalizacja danych przy załadowaniu
  initializeLocalStorage(); // Inicjalizuje dane z localStorage
  updateMainInputs();
  displaySelectedData();
});
