document.addEventListener("DOMContentLoaded", async function () {
  const memberstack = window.$memberstackDom;

  memberstack.getCurrentMember().then(async ({ data: member }) => {
    console.log({ member });
    if (member) {
      const memberJson = await memberstack.getMemberJSON(member.id);
      console.log(memberJson);
      const updatedData = {
        ...memberJson.data,
        avatarURL: "avatar22.jpg",
      };
      console.log(updatedData);

      await memberstack.updateMemberJSON({ json: updatedData });
    }
  });
});
