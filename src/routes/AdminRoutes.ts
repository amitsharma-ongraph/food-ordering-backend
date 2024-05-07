import express, { Request, Response } from "express";
import Restaurant from "../models/restaurant";

export const AdminRouter = express.Router();

AdminRouter.get(
  "/restaurants/applications",
  async (req: Request, res: Response) => {
    try {
      const restroList = await Restaurant.find({ status: "Pending" }).populate(
        "ownerId"
      );
      if (restroList) {
        return res.status(200).send({
          success: true,
          restroList: restroList.map((restro) => {
            const owner = restro.ownerId as any;
            return {
              _id: restro.id,
              name: restro.name,
              logoUrl: restro.logoUrl,
              address: restro.outlets[0],
              owner: {
                _id: owner._id,
                name: owner.name,
                email: owner.email,
              },
            };
          }),
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
