// must restart server whenever you make changes in next.config
module.exports = {
  env: {
    MONGO_SRV:
      "mongodb+srv://mainUser:sawa123xx@cluster0-x81cm.mongodb.net/ElegantFurniture?retryWrites=true&w=majority",
    JWT_SECRET: "<insert-jwt-secret>",
    CLOUDINARY_URL: "https://api.cloudinary.com/v1_1/djbn8sdhz/image/upload",
    STRIPE_SECRET_KEY: "<insert-stripe-secret-key>",
  },
}
