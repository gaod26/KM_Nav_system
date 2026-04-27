const express = require("express");
const cors = require("cors");
const floorsRouter = require("./routes/floors");
const routeRouter = require("./routes/route");
const searchRouter = require("./routes/search");
const nearestRouter = require("./routes/nearest");
const authRouter = require("./routes/auth");
const historyRouter = require("./routes/history");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());

app.use(
  express.json({
    strict: true,
  })
);

// Spec: 422 for malformed JSON bodies
app.use((err, req, res, next) => {
  if (err && err.type === "entity.parse.failed") {
    return res.status(422).json({ detail: "Request body is malformed JSON" });
  }
  next(err);
});

// Spec endpoints (no /api prefix)
app.use("/floors", floorsRouter);
app.use("/route", routeRouter);
app.use("/search", searchRouter);
app.use("/nearest", nearestRouter);
app.use("/auth", authRouter);
app.use("/history", historyRouter);

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "km-nav-backend" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ detail: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`KM Nav backend running at http://localhost:${PORT}`);
});
