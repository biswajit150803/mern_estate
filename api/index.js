import express from "express";
import mongoose from "mongoose";
import userRouter from "./routes/user.route.js";
mongoose
  .connect(
    "mongodb+srv://biswa:biswa@estate.njsibiq.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("db connected");
  })
  .catch((err) => {
    console.log(err);
  });
const app = express();
app.listen(3000, () => {
  console.log("server on port 3000");
});

app.use("/api/user", userRouter);
