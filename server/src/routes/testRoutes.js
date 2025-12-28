import express from "express";
import { createTestModel,getModels, getModelsByStart} from "../controllers/testController.js";

const router = express.Router();

router.post("/", createTestModel);
router.get("/", getModels);
router.get("/:startd", getModelsByStart);

// router.get("/", getHoas);
// router.get("/:id", getHoaById);
// router.put("/:id", updateHoaById);

export default router;
