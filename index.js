const express = require("express");
const ejs = require("ejs")
const Handlebars = require("handlebars");
const moment = require("moment");
const fs = require("fs")
const util = require("util")
const app = express();
const dummmyData = require("./data");

const readFile = util.promisify(fs.readFile)


var result = dummmyData.map(d => ({
    ...d,
    name: `${d.first_name} ${d.last_name || ""}`,
    date: moment(d.checkin_time).format("MMM DD, YYYY"),
    time: d.checkout_time ? Math.ceil(moment(d.checkout_time).diff(d.checkin_time, "minutes", true)) : 0
}));

const getChild = d => {
    return {
        checkinTime: d.checkin_time ? moment(d.checkin_time).format("llll") : "",
        checkoutTime: d.checkout_time ? moment(d.checkout_time).format("llll") : "",
        time: d.time,
        status: d.status
    }
}


const groupByStaffAndDate = () => {
    const groupedData = result.reduce((acc, d) => {
        if (acc[d.name]) {
            if (acc[d.name]["date"][d.date]) {
                acc[d.name].time = acc[d.name].time + d.time;
                acc[d.name]["date"][d.date].time = acc[d.name]["date"][d.date].time + d.time;
                acc[d.name]["date"][d.date].data.push(getChild(d))
            } else {
                acc[d.name].time = acc[d.name].time + d.time;
                acc[d.name].days = acc[d.name].days + 1;
                acc[d.name]["date"][d.date] = {
                    time: d.time,
                    data: [getChild(d)]
                }
            }
        } else {
            acc[d.name] = {
                time: d.time,
                days: 1,
                date: {
                    [d.date]: {
                        time: d.time,
                        data: [getChild(d)]
                    }
                }
            }
        }
        return acc;
    }, {})

    return Object.keys(groupedData).map(staff => {
        const dates = Object.keys(groupedData[staff].date || {}).map(dt => {
            return {
                date: dt,
                time: groupedData[staff].date[dt].time,
                data: groupedData[staff].date[dt].data
            }
        })
        return {
            name: staff,
            time: groupedData[staff].time,
            days: groupedData[staff].days,
            dates
        }
    })
}

app.get("/hbs", async(req, res) => {
    Handlebars.registerHelper('json', function(context) {
        return JSON.stringify(context);
    });

    const indexFile = await readFile("./hbs/index.hbs", "utf8");
    const chart = await readFile("./hbs/chart.hbs", "utf8");
    const table = await readFile("./hbs/table.hbs", "utf8");
    Handlebars.registerPartial('chart', chart);
    Handlebars.registerPartial('table', table)

    Handlebars.registerHelper('ifCond', function(v1, v2, options) {
        if (v1 === v2) {
            return options.fn(this);
        }
        return options.inverse(this);
    });

    const template = Handlebars.compile(indexFile);
    const tableData = groupByStaffAndDate();
    const chartData = tableData.map(d => ({
        name: d.name,
        days: d.days,
        time: d.time ? parseFloat((d.time / 60).toFixed(2)) : 0
    }))
    var filterRange = {
        startDate: "08/01/2021",
        endDate: "08/16/2021"
    }
    var groupBy = "checkin"
    const str = template({ chartData, filterRange, tableData, groupBy })
    return res.header({ "Content-Type": "text/html; charset=UTF-8" }).send(str)
})

app.get("/", (req, res) => {
    const tableData = groupByStaffAndDate();
    const chartData = tableData.map(d => ({
        name: d.name,
        days: d.days,
        time: d.time ? parseFloat((d.time / 60).toFixed(2)) : 0
    }))
    var filterRange = {
        startDate: "08/01/2021",
        endDate: "08/16/2021"
    }
    ejs.renderFile("./template.ejs", { chartData, filterRange, tableData }, (err, str) => {
        if (err) {
            return res.status(400).send(err.message)
        }
        return res.header({ "Content-Type": "text/html; charset=UTF-8" }).send(str)
    })
})

app.listen(3000, () => {
    console.log("listening to port 3000")
})