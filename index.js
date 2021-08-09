const express = require("express");
const ejs = require("ejs")
const app = express();

app.get("/", (req, res) => {
    var data = [{ "staff": "Dinesh", "days": 12, "hours": 54 }, { "staff": "Kumar", "days": 2, "hours": 14 }, { "staff": "Disha", "days": 21, "hours": 65 }, { "staff": "Prem", "days": 12, "hours": 54 }, { "staff": "Nivy", "days": 15, "hours": 62 }, { "staff": "Vijay", "days": 23, "hours": 76 }, { "staff": "Vishali", "days": 11, "hours": 51 }, { "staff": "Diviya", "days": 3, "hours": 32 }, { "staff": "Dinesh", "days": 12, "hours": 54 }, { "staff": "Kumar", "days": 2, "hours": 14 }, { "staff": "Disha", "days": 21, "hours": 65 }, { "staff": "Prem", "days": 12, "hours": 54 }, { "staff": "Nivy", "days": 15, "hours": 62 }, { "staff": "Vijay", "days": 23, "hours": 76 }, { "staff": "Vishali", "days": 11, "hours": 51 }, { "staff": "Diviya", "days": 3, "hours": 32 }, { "staff": "Disha", "days": 21, "hours": 65 }, { "staff": "Prem", "days": 12, "hours": 54 }, { "staff": "Nivy", "days": 15, "hours": 62 }, { "staff": "Vijay", "days": 23, "hours": 76 }, { "staff": "Vishali", "days": 11, "hours": 51 }, { "staff": "Diviya", "days": 3, "hours": 32 }]
    var filterRange = {
        startDate: "08/01/2021",
        endDate: "08/16/2021"
    }
    ejs.renderFile("./template.ejs", { data, filterRange }, (err, str) => {
        if (err) {
            return res.status(400).send(err.message)
        }
        return res.header({ "Content-Type": "text/html; charset=UTF-8" }).send(str)
    })
})

app.listen(3000, () => {
    console.log("listening to port 3000")
})