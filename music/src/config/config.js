import { config as configDotenv } from "dotenv"


configDotenv();

const _config = {
  MONGO_URI: process.env.MONGO_URI
}

export default _config;