console.log("my script 1");
document.addEventListener("DOMContentLoaded", async function () {
  // shortens reference to Memberstack
  const memberstack = window.$memberstackDom;

  console.log("my script 2");

  memberstack.getCurrentMember().then(async ({ data: member }) => {
    // if the member is logged in
    if (member) {
      // Get current member's JSON
      let memberJson = await memberstack.getMemberJSON();

      // Modify or add new data
      memberJson.avatarURL = "avatar.jpg";

      // Remove data
      delete memberJson.skills;

      // Update member's JSON
      await memberstack.updateMemberJSON({ json: memberJson });

      // Log the updated JSON data
      console.log(await memberstack.getMemberJSON());
    }
  });
});
