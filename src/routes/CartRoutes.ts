import { Request, Response, Router } from "express";
import { isLoggedIn } from "../middlewares/authMiddleware";
import User from "../models/user";

export const CartRouter = Router();

CartRouter.get("/get",async(req:Request,res:Response)=>{
    //@ts-ignore
    const userId=req.session.passport.user;
    const user=await User.findById(userId);
    if(!user){
        return res.status(200).send({
            success:false,
            message:"couldn't fetch your cart at this moment"
        })
    }
    try {
        const cart=user.carts.reduce((map:any,item)=>{
          map[item.restaurantId.toString()]=item.cartItems.map(item=>({
            quantity:item.quantity,
            menuItem:{
                //@ts-ignore
                ...item.menuItem._doc,
                id:item.menuItem.id
            }
          }));
          return map
        },{})
        return res.status(200).send({
            success:true,
            cart
        })
    } catch (error) {
        return res.status(500).send({
            success:false
        })
    }
})

CartRouter.post("/add", isLoggedIn,async (req: Request, res: Response) => {
  const { restaurantId, menuItem } = req.body;
  //@ts-ignore
  const userId=req.session.passport.user
  const user=await User.findById(userId)
  
  try {
    

  if(!user){
    return res.status(200).send({
        success:false,
        message:"Couldn't fetch account at this moment"
    })
  }
  const cart=user.carts.find(c=>c.restaurantId.toString()===restaurantId)
  if(cart){
    const cartItem=cart.cartItems.find(cartItem=>cartItem.menuItem.id.toString()===menuItem.id)
    if(cartItem){
        cartItem.quantity+=1
    }
    else{
        cart.cartItems.push({
            quantity:1,
            menuItem:{...menuItem,_id:menuItem.id}
        })
        user.carts.map(userCart=>userCart.restaurantId===cart.restaurantId?cart:userCart);
      
    }
    user.save();
    return res.status(200).send({
        success:true,
        message:"Item Addedd Successfully"
    })
  }
  else{
    const newCart={
        restaurantId,
        cartItems:[{quantity:1,menuItem:{...menuItem,_id:menuItem.id}}]
    }

    const updatedUser=await User.findByIdAndUpdate(userId,{
        $push:{
            carts:newCart
        }
    })
    if(updatedUser){
        return res.status(200).send({
            success:true,
            message:"Item Added Successfully"
        })
    }
  }
} catch (error) {
    console.log("error--->",error)
    return res.status(500).send({
        success:false
    })
}
});

CartRouter.post("/remove",isLoggedIn,async (req:Request,res:Response)=>{
    const {restaurantId,menuItemId}=req.body
    try {
        //@ts-ignore
        const userId=req.session.passport.user
        const user=await User.findById(userId);
        if(!user){
            return res.status(200).send({
                success:false,
                message:"couldn't access cart details at this moment"
            })
        }
        const cart=user.carts.find(c=>c.restaurantId.toString()===restaurantId);

        if(!cart){
            return res.status(200).send({
                success:false,
                message:"couldn't access your cart at this moment"
            })
        }
        const cartItem=cart.cartItems.find(cartItem=>cartItem.menuItem.id.toString()===menuItemId)
        if(!cartItem){
            return res.status(200).send({
                success:false,
                message:"Invalid Item"
            })
        }
        if(cartItem.quantity===1){
            const newList=cart.cartItems.filter(item=>item.menuItem.id.toString()!==menuItemId)
            if(newList.length===0){
                const newCarts=user.carts.filter(c=>c.restaurantId!==cart.restaurantId)
                await User.findByIdAndUpdate(userId,{
                    carts:newCarts
                })
                return res.status(200).send({
                    success:true
                })
            }
            else{
               cart.cartItems=newList
            }
        }
        else{
            cartItem.quantity-=1;
        }
        user.save();
        return res.status(200).send({
            success:true,
            message:"Item removed successfully"
        })
    } catch (error) {
        return res.status(500).send({
            success:false
        })
    }
})
