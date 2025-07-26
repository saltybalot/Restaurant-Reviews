const mongoose = require("mongoose");
const User = require("./database/models/User");

// MongoDB connection string - update this to match your setup
const connectionString = "mongodb://127.0.0.1:27017/RestaurantDB";

async function migratePasswordHistory() {
  try {
    // Connect to MongoDB
    await mongoose.connect(connectionString);
    console.log("Connected to MongoDB successfully");

    // Find all users without passwordHistory field
    const users = await User.find({ passwordHistory: { $exists: false } });
    console.log(`Found ${users.length} users to migrate`);

    for (const user of users) {
      // Add passwordHistory field to existing users
      user.passwordHistory = [];
      user.passwordHistoryLimit = 5;
      
      // Save the updated user
      await user.save();
      console.log(`Migrated user: ${user.username}`);
    }

    console.log("Password history migration completed successfully");
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
}

// Run the migration
migratePasswordHistory(); 