const fs = require("fs");
const path = require("path");

const logDirectory = path.join(__dirname, "../logs");

if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

const errorLogger = (err, req, res, next) => {
  console.log("📢 Logging error middleware activated!");

  const statusCode = res.statusCode >= 400 ? res.statusCode : 500;
  res.status(statusCode);

  const logFilePath = path.join(
    logDirectory,
    `${new Date().toISOString().split("T")[0]}.log`
  );

  const logMessage = `[${new Date().toISOString()}] - ${statusCode} - ${
    err.message
  } - ${req.method} ${req.originalUrl}\n`;

  console.log("📄 Log file path:", logFilePath);
  console.log("📝 Log content:", logMessage);

  fs.appendFile(logFilePath, logMessage, (error) => {
    if (error) {
      console.error("🚨 Error writing to log file:", error);
    } else {
      console.log("✅ Log entry written successfully!");
    }
  });

  next(err);
};

module.exports = errorLogger;
