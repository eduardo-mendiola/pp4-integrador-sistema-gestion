import "dotenv/config";
import app from "./src/app.js";
import dbConnect from "./src/config/db.js";

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await dbConnect();
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`API server running on ${PORT}`);
    });
  } catch (error) {
    console.error("DB connection error:", error);
    process.exit(1);
  }
})();

