const express = require("express");
const sequelize = require("./config/db");
const usersRouter = require("./routes/user");
const adsRoutes = require("./routes/ads");
const classRoutes = require("./routes/class");
const subjectRoutes = require("./routes/subject");
const teacherRoutes = require("./routes/teacher");
const subscriptionRoutes = require("./routes/subscription");
const lectureRoutes = require("./routes/lecture");
const chapterRoutes = require('./routes/chapterRoutes');


const app = express();
app.use(express.json());
app.use("/uploads", express.static("./" + "uploads"));

sequelize.sync({ force: false })
    .then(() => console.log("✅ Database & User table synced!"))
    .catch(err => console.error("❌ Error syncing database:", err));


app.use("/", usersRouter);
app.use("/", adsRoutes);
app.use("/", classRoutes);
app.use("/", subjectRoutes);
app.use("/", teacherRoutes);
app.use("/", subscriptionRoutes);
app.use("/", lectureRoutes);
app.use("/", chapterRoutes);


app.listen( 4000 , () => {
    console.log(`🚀 Server running on http://localhost:4000`);
});
