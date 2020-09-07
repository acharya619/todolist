const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();
app.use(bodyParser.urlencoded(
    { extended: true }
));
app.use(express.static("public"));
app.set("view engine", "ejs");
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});
const itemSchema = {
    name: String
};
const listSchema = {
    name: String,
    items: [itemSchema]
};
const Item = mongoose.model("Item", itemSchema);
const List = mongoose.model("list", listSchema);
const item1 = new Item({
    name: "Welcome to todo list"
});
const item2 = new Item({
    name: "hit + button to add items"
});
const item3 = new Item({
    name: "tap to delete items"
});
const itemsArray = [item1, item2, item3];

app.get("/", function (req, res){
    var today = new Date();
    options = {
        weekday : "long",
        day: "numeric",
        month:"long"
    };
    var day = today.toLocaleDateString("en-US", options);
    Item.find({}, function(err, foundItems){
        if(err){
            console.log("Error occured while retrieving data");
        }else{
            let itemlist = foundItems;
            if(typeof itemlist !== 'undefined' && itemlist.length === 0){
                Item.insertMany(itemsArray, function(err){
                    if(err){
                        console.log(err);
                    }else { 
                        console.log("Successfully added");
                    }
                });
                res.redirect("/");
            }else{
                res.render("list", {dayname: day, newItems: itemlist});
            } 
        }
    });
    
});
app.post("/", function(req, res){
    let today = new Date();
    options = {
        weekday : "long",
        day: "numeric",
        month:"long"
    };
    let day = today.toLocaleDateString("en-US", options);
    if(req.body.add !== day){
        const listname = req.body.add;
        List.findOne({name: listname}, function (err, found){
            const itm = new Item({
                name: req.body.newItem
            });
            found.items.push(itm);
            found.save();
            res.redirect("/"+listname);
        });
    }else{
        if(req.body.newItem!=="")
        {
        const itm = new Item({
            name: req.body.newItem
        }); 
        itm.save();
        }
        res.redirect("/");
    }
    
});
app.post("/delete", function (req, res){
    let today = new Date();
    options = {
        weekday : "long",
        day: "numeric",
        month:"long"
    };
    let day = today.toLocaleDateString("en-US", options);
    const body = req.body;
    const idTodlt = Object.keys(body)[0];
    const listname = body[idTodlt];
    console.log(idTodlt);
    if(listname !== day){
        List.findOne({name: listname}, function (err, found){
            if(found){
                found.items = found.items.filter(function(obj){
                    return obj.id !== idTodlt;
                });
                console.log(found);
                found.save();
                res.redirect("/"+listname);
            }
        });
    }else{
        Item.deleteOne({_id: idTodlt}, function (err){
            if (err){
                console.log("Error while deleting");
            }else{
                res.redirect("/");
            }
        });
    }
    
});
app.get("/:topic", function (req, res){
    const listname = _.capitalize(req.params.topic);
    List.findOne({name: listname}, function(err, found){
        if(!found){
            const list = new List({
                name: listname,
                items: itemsArray
            });
            list.save();
            console.log("added "+listname);
            res.redirect("/"+listname);
        }else{
            res.render("list", {dayname: listname, newItems: found.items})
        }
    });
    
});
app.listen(3000, function(){
    console.log("Started listening to port no 3000");
});