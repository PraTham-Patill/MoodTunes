const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // No need for deprecated options in recent versions
    });
    console.log(`MongoDB Atlas connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;


// const { MongoClient, ServerApiVersion } = require('mongodb');
// const dotenv = require('dotenv'); // Import dotenv to use environment variables

// // Load environment variables
// dotenv.config();

// const uri = process.env.MONGO_URI; // Use the URI from the .env file

// // Initialize MongoClient with options
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });

// Function to connect to the database
// async function connectDB() {
//   try {
//     // Connect to the MongoDB cluster
//     await client.connect();

//     // Optional: Ping the database to ensure the connection is successful
//     await client.db("healthguardpro").command({ ping: 1 });

//     console.log("MongoDB Atlas connected successfully for HealthGuard Pro!");
//   } catch (error) {
//     console.error(`Error connecting to MongoDB: ${error.message}`);
//     process.exit(1); // Exit process if connection fails
//   }
// }

// module.exports = { client, connectDB };
