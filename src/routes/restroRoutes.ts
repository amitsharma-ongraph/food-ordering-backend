import express, { Request, Response } from "express";
import Restaurant from "../models/restaurant";
import { IAddress } from "../../types/Schema/IAddress";

const restroRouter = express.Router();

restroRouter.get("/available", async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const userId = req.session.passport.user;
    const restros: any = await Restaurant.find({ ownerId: userId });
    const restro = restros[0];
    if (restro) {
      return res.status(200).send({
        success: true,
        restaurant: restro,
      });
    }
    return res.status(200).send({
      success: false,
    });
  } catch (error) {
    return res.status(500);
  }
});

restroRouter.post("/signup", async (req: Request, res: Response) => {
  try {
    const { name, addressLine, city, country, zipCode, logoUrl, userId } =
      req.body;
    const restro = new Restaurant({
      name,
      logoUrl,
      outlets: [{ addressLine, city, country, zipCode } as IAddress],
      cuisins: [],
      menuItems: [],
      status: "Pending",
      ownerId: userId,
    });
    await restro.save();
    return res.status(200).send({
      success: true,
    });
  } catch (error) {
    res.status(500);
  }
});

export default restroRouter;
