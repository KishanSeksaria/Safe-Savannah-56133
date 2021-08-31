// getting hold of express module for our project
const express = require("express");

const mongoAdminPassword = require(__dirname + "/keys.js");

// getting hold of the lodash module for our project
const _ = require("lodash");

// getting hold of mongoose module to implement mongoDB as our database
const mongoose = require("mongoose");

// requiring the locally created module to use its features
const date = require(__dirname + "/date.js");

// creating instance of express called app and using it as a call to express
const app = express();

// Using EJS as our template engine, so setting it up in our app
app.set("view engine", "ejs");

// using the url encoded parser of express package to retrive data encoded within our post request
app.use(express.urlencoded({
    extended: true
}));

// specifying to express that we want to serve the static files inside the public folder to the server too
app.use(express.static("public"));

const mongoAtlasLink = "mongodb+srv://admin-kishan:" + mongoAdminPassword + "@todo-list-db.jajhw.mongodb.net/todolistDB";

// connecting to local mongoDB server
mongoose.connect(mongoAtlasLink, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

// checking if the connection was made successfully or not
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
    console.log("We're connected");
    // we're connected!
});

// Creating an item Schema for our database
const itemSchema = new mongoose.Schema({
    name: String,
});

// creating a model/collection called items in our db
// Note that mongoose always converts the singular form into plural form when creating a collection
const Item = mongoose.model("Item", itemSchema);

// Creating the items/documents for our items collection
const item1 = new Item({
    name: "Welcome to my TO-DO list",
});

const item2 = new Item({
    name: "Click the + button to add a new item",
});

const item3 = new Item({
    name: "<-- Click here to delete an item",
});

// creating an array to store all the items created initially
const defaultItems = [item1, item2, item3];

// creating a handler for any kind of get request to our home/root directory
app.get("/", (req, res) => {
    List.findOne({
        listName: "Today"
    }, (err, foundList) => {
        if (err) {
            console.log(err);
        } else {
            if (!foundList) {
                const newList = new List({
                    listName: "Today",
                    items: defaultItems
                });
                newList.save();
                res.redirect("/");
            } else {
                if (foundList.items.length === 0) {
                    foundList.items.push(item1);
                    foundList.items.push(item2);
                    foundList.items.push(item3);
                    foundList.save();
                }
                res.render("day", {
                    title: foundList.listName,
                    newItems: foundList.items
                });
            }
        }
    });

});

// Creating a schema for every list that we create
const listSchema = new mongoose.Schema({
    listName: String,
    items: [itemSchema]
});

// Creating collection called lists in the database to house all the custom lists created using custom express routes
const List = mongoose.model("List", listSchema);

// trying to create new list for every new custom parameter
app.get("/:listName", (req, res) => {
    const newListName = _.capitalize(req.params.listName);
    List.findOne({
        listName: newListName
    }, (err, foundList) => {
        if (err) {
            console.log(err);
        } else {
            if (!foundList) {
                const newList = new List({
                    listName: newListName,
                    items: defaultItems
                });
                newList.save();
                res.redirect(`/${newListName}`);
            } else {
                if (foundList.items.length === 0) {
                    foundList.items.push(item1);
                    foundList.items.push(item2);
                    foundList.items.push(item3);
                    foundList.save();
                }
                res.render("day", {
                    title: foundList.listName,
                    newItems: foundList.items
                });
            }
        }
    });
});

// creating a handler for any kind of post request to our home/root directory
// In our case, this happens when the user tries to insert a new item into the list, more specifically, when pressing the '+' button
app.post("/", (req, res) => {
    const currentListName = _.capitalize(req.body.list);
    List.findOne({
        listName: currentListName
    }, (err, foundList) => {
        if (err) {
            console.log(err);
        } else {
            if (!foundList) {
                console.log('List Not Found!!');
            } else {
                const item = new Item({
                    name: req.body.newItem
                });
                foundList.items.push(item);
                foundList.save();
                console.log("item added");
            }
        }
    });

    // redirecting to the list directory
    res.redirect("/" + currentListName);
});

app.post("/delete", (req, res) => {
    const deleteItemId = req.body.checkbox;
    const currentListName = req.body.listName;
    List.findOneAndUpdate({
        listName: currentListName
    }, {
        $pull: {
            items: {
                _id: deleteItemId
            }
        }
    }, (err, foundList) => {
        if (err) {
            console.log(err);
        } else {
            if (!foundList) {
                console.log("Current List not found. Deletion unsuccessful.");
            } else {
                console.log("Deletion Successful!");
            }
        }
    });
    res.redirect("/" + currentListName);
});


// listening on default port 80 for running our server
app.listen(80, () => {
    console.log("Server up and running.");
});