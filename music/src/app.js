import express from "express"
import musicRoutes from "./routes/music.route.js"
import cookieParser from "cookie-parser";


const app = express();
app.use(express.json())
app.use(cookieParser())

app.use("/api/music", musicRoutes)

export default app;