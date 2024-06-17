import express, { Request, Response } from "express";
import Restaurant from "../models/restaurant";
import Coupon from "../models/coupon";

const SearchRouter = express.Router();

SearchRouter.get("/group-suggestion", async (req: Request, res: Response) => {
  try {
    const restaurants = await Restaurant.find({}, { menuItems: 1 }).limit(16);

    const allMenuItems = restaurants.flatMap(
      (restaurant) => restaurant.menuItems
    );
    const map = new Map();
    allMenuItems.forEach((item) => {
      const groupName = item.groupName.toLowerCase();
      if (!map.has(groupName)) {
        map.set(groupName, item.imageUrl);
      }
    });

    let allGroups: {
      groupName: string;
      imageUrl: string;
    }[] = [];

    map.forEach((value, key) => {
      allGroups.push({
        groupName: key,
        imageUrl: value,
      });
    });

    return res.status(200).send({
      success: true,
      groups: allGroups,
    });
  } catch (error) {
    console.error("Error fetching distinct pairs:", error);
    throw error;
  }
});

SearchRouter.get("/:keyword", async (req: Request, res: Response) => {
  try {
    const { keyword } = req.params;

    const restaurants = await Restaurant.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        {
          cuisins: { $regex: keyword, $options: "i" },
        },
        {
          menuGroups: { $regex: keyword, $options: "i" },
        },
        {
          "menuItems.name": { $regex: keyword, $options: "i" },
        },
      ],
    });

    const allRestaurants = restaurants.map((restro) => ({
      id: restro._id,
      name: restro.name,
      ratings: restro.ratings,
      logoUrl: restro.logoUrl,
      tags: restro.cuisins.splice(0, 2),
    }));

    return res.status(200).send({
      success: true,
      allRestaurants,
    });
  } catch (error) {
    return res.status(200).send({
      success: false,
      message: "unexpected error occured",
    });
  }
});

SearchRouter.get(
  "/search-options/:keyword",
  async (req: Request, res: Response) => {
    try {
      const { keyword } = req.params;

      const restaurants = await Restaurant.find(
        {
          $or: [
            { name: { $regex: keyword, $options: "i" } },
            {
              cuisins: { $regex: keyword, $options: "i" },
            },
            {
              menuGroups: { $regex: keyword, $options: "i" },
            },
            {
              "menuItems.name": { $regex: keyword, $options: "i" },
            },
          ],
        },
        "name logoUrl cuisins menuGroups menuItems"
      ).limit(10);

      const keywords = restaurants.flatMap((restaurant) => {
        const keywordObjects = [];

        if (restaurant.name.toLowerCase().includes(keyword.toLowerCase())) {
          keywordObjects.push({
            value: restaurant.name,
            matchField: "Restaurants",
            logoUrl: restaurant.logoUrl,
          });
        }

        restaurant.menuGroups.forEach((group) => {
          if (group.toLowerCase().includes(keyword.toLowerCase())) {
            keywordObjects.push({
              value: group,
              matchField: "Dishes",
              logoUrl: null,
            });
          }
        });

        restaurant.menuItems.forEach((item) => {
          if (item.name.toLowerCase().includes(keyword.toLowerCase())) {
            keywordObjects.push({
              value: item.name,
              matchField: "Dishes",
              logoUrl: item.imageUrl,
            });
          }
        });

        restaurant.cuisins.forEach((cuisine) => {
          if (cuisine.toLowerCase().includes(keyword.toLowerCase())) {
            keywordObjects.push({
              value: cuisine,
              matchField: "Cuisines",
              logoUrl: null,
            });
          }
        });

        return keywordObjects;
      });

      const filteredKeywords = Object.values(
        keywords.reduce((acc: any, obj: any) => {
          acc[obj.value.toLowerCase()] = acc[obj.value.toLowerCase()] || obj;
          return acc;
        }, {})
      );

      return res.status(200).send({
        success: true,
        searchOptions: filteredKeywords,
      });
    } catch (error) {
      console.log("errrror---.", error);
      return res.status(200).send({
        success: false,
        message: "unexpected error occured",
      });
    }
  }
);

SearchRouter.get("/restro-menu/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const restaurant = await Restaurant.findById(id);

    const menuList = restaurant?.menuItems.map((menuItem) => ({
      //@ts-ignore
      id: menuItem._id,
      name: menuItem.name,
      price: menuItem.price,
      ratings: menuItem.ratings,
      imageUrl: menuItem.imageUrl,
      totalReview: menuItem.totalReview,
      description: menuItem.description,
      groupName: menuItem.groupName,
    }));
    const coupons = await Coupon.find({
      restroId: id,
      isPublic: true,
      activated: true,
    });
    if (restaurant) {
      return res.status(200).send({
        success: true,
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
          outlets: restaurant.outlets,
          cuisins: restaurant.cuisins,
          menuItems: menuList,
          logoUrl: restaurant.logoUrl,
          ratings: restaurant.ratings,
          menuGroups: restaurant.menuGroups,
          coupons,
        },
      });
    }
  } catch (error) {
    return res.status(200).send({
      success: false,
    });
  }
});

export default SearchRouter;
