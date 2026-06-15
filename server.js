import "dotenv/config";
import app from "./src/app.js";
import dbConnect from "./src/config/db.js";

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await dbConnect();
    console.log("MongoDB connected");

    app.listen(PORT, "127.0.0.1", () => {
      console.log(`API server running on http://127.0.0.1:${PORT}`);
    });
  } catch (error) {
    console.error("DB connection error:", error);
    process.exit(1);
  }
})();
