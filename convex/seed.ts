import { mutation } from "./_generated/server";

export default mutation(async (_ctx) => {
  // Database reset: No essential data will be seeded automatically.
  // The system will start from a blank state, requiring user registration.
  console.log("Database reset: Skipping seeding as requested.");
});
