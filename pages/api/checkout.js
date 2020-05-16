import Stripe from "stripe"
import uuidv4 from "uuid/v4"
import jwt from "jsonwebtoken"
import Cart from "../../models/Cart"
import Order from "../../models/Order"
import calculateCartTotal from "../../utils/calculateCartTotal"

const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

export default async (req, res) => {
  const { paymentData } = req.body

  try {
    // 1. verify and get userId from token
    const { userId } = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    )
    // 2. find the cart based on the userId and populate it
    const cart = await Cart.findOne({ user: userId }).populate({
      path: "products.product",
      model: "Product",
    })
    // 3. calculate cart totals again from cart products
    const { cartTotal, stripeTotal } = calculateCartTotal(cart.products)
    // 4. get email from payment data and see if email is linked
    //    with existing Stripe customer
    const prevCustomer = await stripe.customers.list({
      email: paymentData.email,
      limit: 1,
    })
    const isExistingCustomer = prevCustomer.data.length > 0
    // 5. if NOT existing customer, create them based on their email
    let newCustomer
    if (!isExistingCustomer) {
      newCustomer = await stripe.customers.create({
        email: paymentData.email,
        source: paymentData.id,
      })
    }
    const customer =
      (isExistingCustomer && prevCustomer.data[0].id) || newCustomer.id
    // 6. generate a charge with the total and send email receipt
    const charge = await stripe.charges.create(
      {
        currency: "usd",
        amount: stripeTotal,
        receipt_email: paymentData.email,
        customer,
        description: `Checkout | ${paymentData.email} | ${paymentData.id}`,
      },
      {
        idempotency_key: uuidv4(),
      }
    )
    // 7. add order data to database
    await new Order({
      user: userId,
      email: paymentData.email,
      total: cartTotal,
      products: cart.products,
    }).save()
    // 8. clear products in cart
    await Cart.findOneAndUpdate({ _id: cart._id }, { $set: { products: [] } })
    // 9. send back a success (200) response
    res.status(200).send("Checkout was Successful")
  } catch (error) {
    console.error(error)
    res.status(500).send("Error processing charge")
  }
}
