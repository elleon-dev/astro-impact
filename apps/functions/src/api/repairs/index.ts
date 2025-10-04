import { Router } from "express";
import { postRepair } from "./controller";

const router = Router();

router.post("/", postRepair);

export default router;
