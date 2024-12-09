document.addEventListener("DOMContentLoaded", async function () {
  const memberstack = window.$memberstackDom;

  memberstack.getCurrentMember().then(async ({ data: member }) => {
    console.log({ member });
    if (member) {
      let memberJson = await memberstack.getMemberJSON(member.id);
      console.log({ memberJson });
      const updatedData = {
        ...memberData.data,
        avatarURL: "avatar.jpg",
      };

      await memberstack.updateMemberJSON({ json: updatedData });
    }
  });
});
