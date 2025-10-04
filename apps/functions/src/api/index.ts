import express from "express";
import cors from "cors";
import {errorHandler, validateRequest} from "./_middlewares";
import {body} from "express-validator";
import {postContact,} from "./emails";
import {postUser} from "./users";
import repairsRouter from "./repairs";

const app: express.Application = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => res.status(200).send("Welcome!"));

app.post(
  "/users/:userId",
  [
    body("id").exists(),
    body("email").exists(),
    body("password").exists(),
    body("roleCode").exists(),
    body("updateBy").exists(),
  ],
  postUser,
);

// EMAILS
app.post(
  "/emails/contact",
  [
    body("contact.phone").exists(),
    body("contact.email").exists(),
    body("contact.hostname").exists(),
  ],
  validateRequest,
  postContact,
);

//IUBIZON - REPAIRS SERVICES
app.use("/iubizon/repairs", repairsRouter);

app.use(errorHandler);

export { app };
