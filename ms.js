document.addEventListener("DOMContentLoaded", async function () {
  const memberstack = window.$memberstackDom;

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

      // const updatedData = {
      //   ...memberJson.data,
      //   test: "test.jpg",
      // };

      // console.log(updatedData);

      // await memberstack.updateMemberJSON({ json: updatedData });
    }
  });
});
