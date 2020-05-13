import connectDB from "../../utils/connectDb"
import User from "../../models/User"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

connectDB()

export default async (req, res) => {
  const { name, email, password } = req.body
  try {
    const user = await User.findOne({ email })
    // 1. check if user exists
    if (user) {
      return res.status(422).send(`User already exixts with email ${email}`)
    }
    // 2. harsh user's password
    const hash = await bcrypt.hash(password, 10)
    // 3. create new user
    const newUser = await new User({
      name,
      email,
      password: hash
    }).save()
    console.log({ newUser })
    // 4. create token new user
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    })
    // 5. send back token
    res.status(201).json(token)
  } catch (error) {
    console.log(error)
    res.status(500).send("Error signing up user. Please try again.")
  }
}
