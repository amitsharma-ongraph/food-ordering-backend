import express, { Request, Response } from "express";
import Restaurant from "../models/restaurant";
import { IAddress } from "../../types/Schema/IAddress";
import { HydratedDocument } from "mongoose";
import { IRestaurant } from "../../types/Schema/IRestaurant";

const restroRouter = express.Router();

restroRouter.get("/available", async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const userId = req.session.passport.user;
    const restros: any = await Restaurant.find({ ownerId: userId }).populate(
      "ownerId"
    );
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
    const {
      name,
      addressLine,
      city,
      country,
      zipCode,
      logoUrl,
      ownerId,
      longitude,
      latitude,
    } = req.body;
    const restro = new Restaurant({
      name,
      logoUrl,
      outlets: [
        {
          addressLine,
          city,
          country,
          zipCode,
          longitude,
          latitude,
        } as IAddress,
      ],
      cuisins: [],
      menuItems: [],
      status: "Pending",
      ownerId,
      menuGroups: [],
    });
    await restro.save();
    return res.status(200).send({
      success: true,
    });
  } catch (error) {
    res.status(500);
  }
});

restroRouter.post("/add-menu-group", async (req: Request, res: Response) => {
  try {
    const { groupName, restroId } = req.body;
    const updatedRestro = await Restaurant.findByIdAndUpdate(restroId, {
      $push: {
        menuGroups: groupName,
      },
    });
    if (updatedRestro) {
      return res.status(200).send({
        success: true,
        groupName,
      });
    }
    return res.status(200).send({
      success: false,
    });
  } catch (error) {
    return res.status(500).send({});
  }
});

restroRouter.post("/add-cuisine", async (req: Request, res: Response) => {
  try {
    const { cuisineName, restroId } = req.body;
    const updatedRestro = await Restaurant.findByIdAndUpdate(restroId, {
      $push: {
        cuisins: cuisineName,
      },
    });
    if (updatedRestro) {
      return res.status(200).send({
        success: true,
        cuisineName,
      });
    }
    return res.status(200).send({
      success: false,
    });
  } catch (error) {
    return res.status(500).send({});
  }
});

restroRouter.post("/add-menuitem", async (req: Request, res: Response) => {
  const { name, description, price, imageUrl, restroId, groupName } = req.body;
  const updatedRestro = await Restaurant.findByIdAndUpdate(
    restroId,
    {
      $push: {
        menuItems: {
          name,
          price,
          groupName,
          ratings: "4.0",
          totalReview: 0,
          imageUrl,
          description,
          totalOrders: 0,
        },
      },
    },
    { new: true }
  );
  if (updatedRestro) {
    //@ts-ignore
    const menuItemId = updatedRestro.menuItems[updatedRestro.menuItems.length - 1]._id;
    return res.status(200).send({
      success: true,
      menuItemId,
    });
  }
  return res.status(200).send({
    success: false,
  });
});

restroRouter.delete("/delete", async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const userId = req.session.passport.user;
    const restros: any = await Restaurant.find({ ownerId: userId }).populate(
      "ownerId"
    );
    const restro = restros[0];
    if (restro) {
      await Restaurant.findByIdAndDelete(restro.id);
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



restroRouter.get("/clone", async (req: Request, res: Response) => {
  try {
    const sourceRestaurant: any = await Restaurant.findById(
      "66436784f4636d4d8292dfce"
    );

    const { menuGroups, menuItems } = sourceRestaurant;
    await Restaurant.updateMany(
      { _id: { $ne: "66436784f4636d4d8292dfce" } },
      {
        $addToSet: {
          menuGroups: { $each: menuGroups },
          menuItems: { $each: menuItems },
        },
      }
    );

    console.log(
      "Menu groups and menu items updated successfully for other restaurants."
    );
  } catch (error) {
    console.error("Error updating restaurants:", error);
  }
});

restroRouter.post("/add-outlet", async (req: Request, res: Response) => {
  const {
    id,
    address: {
      city,
      country,
      zipCode,
      addressLine,
      isPrimary,
      longitude,
      latitude,
    },
  } = req.body;
  try {
    const updatedRestro: IRestaurant | null =
      await Restaurant.findByIdAndUpdate(
        id,
        {
          $push: {
            outlets: {
              city,
              country,
              zipCode,
              addressLine,
              isPrimary,
              longitude,
              latitude,
            },
          },
        },
        { new: true }
      );

    if (!updatedRestro) {
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }
    const { _id: addressId } = updatedRestro.outlets[
      updatedRestro.outlets.length - 1
    ] as any;
    return res.status(201).send({
      success: true,
      message: "Outlet Added Succesfully",
      addressId,
    });
  } catch (error) {
    return res.status(500);
  }
});

restroRouter.get("/get-all", async (req: Request, res: Response) => {
  try {
    const { rating,veg } = req.query;
    let filter:any={status:"Approved"}
    if(rating){
      filter.ratings={"$gte":"4"}
    }
    if(veg){
      filter.isVeg=true
    }
    const restaurants = await Restaurant.find(filter);
    const allRestaurants = restaurants.map((restro) => ({
      id: restro._id,
      name: restro.name,
      ratings: restro.ratings,
      logoUrl: restro.logoUrl,
      tags: restro.cuisins.splice(0, 2),
    }));
    res.status(200).send({
      success: true,
      allRestaurants,
    });
  } catch (error) {
    res.status(200).send({
      success: false,
    });
  }
});

export default restroRouter;
