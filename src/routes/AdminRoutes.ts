import express, { Request, Response } from "express";
import Restaurant from "../models/restaurant";
import { isAdmin } from "../middlewares/authMiddleware";

export const AdminRouter = express.Router();

AdminRouter.get(
  "/restaurants",
  isAdmin,
  async (req: Request, res: Response) => {
    try {
      const restroList = await Restaurant.find().populate("ownerId");
      if (restroList) {
        return res.status(200).send({
          success: true,
          restroList: restroList,
        });
      }
      return res.status(200).send({
        success: false,
        message: "Error while fetching restaurant applications",
      });
    } catch (error) {
      return res.status(200).send({
        success: false,
      });
    }
  }
);

AdminRouter.post("/restaurant/accept", async (req: Request, res: Response) => {
  try {
    const updatedRestro = await Restaurant.findByIdAndUpdate(
      req.body.restroId,
      { status: "Approved" }
    );
    if (updatedRestro) {
      return res.status(200).send({
        success: true,
      });
    }
    return res.status(200).send({
      success: false,
    });
  } catch (error) {
    return res.status(200).send({
      success: false,
    });
  }
});

AdminRouter.post("/restaurant/reject", async (req: Request, res: Response) => {
  try {
    const updatedRestro = await Restaurant.findByIdAndUpdate(
      req.body.restroId,
      { status: "Rejected" }
    );
    if (updatedRestro) {
      return res.status(200).send({
        success: true,
      });
    }
    return res.status(200).send({
      success: false,
    });
  } catch (error) {
    return res.status(200).send({
      success: false,
    });
  }
});
