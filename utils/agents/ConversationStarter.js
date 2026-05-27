const ConversationStarter = async (z, model) => {
  const schema = z.object({
    users: z.array(
      z.object({
        name: z.string(),
        followersCount: z.number(),
      })
    ),
  });
  const users = [
    {
      name: "Joe Doe",
      followersCount: 6,
    },
    {
      name: "Josh",
      followersCount: 60,
    },
    {
      name: "Divine",
      followersCount: 40,
    },
    {
      name: "David",
      followersCount: 0,
    },
    {
      name: "Daniel",
      followersCount: 100,
    },
  ]
  const structuredModel = model.withStructuredOutput(schema);
  try {
    const response = await structuredModel.invoke(
      `Users: ${JSON.stringify(users)}, i want you to give me a user object with highest follower count not less than 60`
    );
    console.log(response);
  } catch (error) {
    console.log(error);
  }
}

module.exports = { ConversationStarter };