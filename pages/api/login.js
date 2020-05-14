import connectDB from "../../utils/connectDb"
import User from "../../models/User"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

connectDB()

export default async (req, res) => {
  const { email, password } = req.body
  try {
    // 1. check if user exists based on email provided
    const user = await User.findOne({ email }).select("+password")
    // 2. --if not, return error
    if (!user) {
      return res.status(404).send("No user exists with that email")
    }
    // 3. check if user's password is matches the db record
    const passwordsMatch = await bcrypt.compare(password, user.password)
    // 4. --if so, generate a token
    if (passwordsMatch) {
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d"
      })
      res.status(200).json(token)
    } else {
      res.status(401).send("Passwords do not match")
    }
  } catch (error) {
    console.error(error)
    res.status(500).send("Error logging in user")
  }
}
