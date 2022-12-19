//jshint esversion:6

const express = require("express");
const https = require('https');
const mongoose = require("mongoose");
const _ = require('lodash');
require('dotenv').config();
// const date = require(__dirname + "/date.js");

const app = express();

// const newPosts = [];
// const workItems = [];

app.set('view engine', 'ejs');

app.use(express.static("Public"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(process.env.API_KEY);
}

const postSchema = {
    name: String
  };

  const posts = mongoose.model(
    "posts",
    postSchema
  );

  const posts1 = new posts ({
    name: "Welcome to your todolist."
  });

  const posts2 = new posts ({
    name: "Hit the + button to add a new item."
  });

  const posts3 = new posts ({
    name: "<-- Hit this to delete an item."
  });

  const defaultPosts = [posts1, posts2, posts3];

  const listSchema = {
    name: String,
    posts: [postSchema]
  };

  const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  posts.find({}, function(err, foundPosts){
    if(foundPosts.length === 0) {
      posts.insertMany(defaultPosts, function(err){
        if(err) {
          console.log(err);
        } else {
          console.log("Successfully inserted many items into the database.");
        }
    });
    res.redirect("/");
    } else {
     res.render("list", {listTitle: "Today", newTodos: foundPosts});
    }


    
  });

  

  // const day = date.getDate();

  
});


app.post("/", function(req, res) {
  const postName = req.body.newTodo;
  const listName = req.body.list;

  const newPost = new posts ({
    name: postName
  });

  if(listName === "Today") {
    newPost.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.posts.push(newPost);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

  

  // if(req.body.list === "Work") {
  //   workItems.push(newPost);

  //   res.redirect("/work");
  // } else {
  //   newPosts.push(newPost);

  //   res.redirect("/");
  // }

});

app.post("/delete", function(req, res){
  const delCheck = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today") {
    posts.findByIdAndRemove(delCheck, function(err){
    if(err) {
     console.log(err);
     } else {
     console.log("Successfully deleted an item from the db.");
     res.redirect("/");
     }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {posts: {_id: delCheck}}}, function(err, foundList){
      if(!err) {
        res.redirect("/" + listName);
      }
    });
  }

  
  
});

// app.get("/work", function(req, res) {
//   res.render("list", {listTitle: "Work List", newTodos: workItems});
// });

// app.get("/about", function(req, res) {
//   res.render("about");
// });

app.get("/:customName", function(req, res){
  const customName = _.capitalize(req.params.customName);

  

  List.findOne({name: customName},function(err, foundList){
    if(!err) {
      if(!foundList){
        // new list
      const list = new List({
           name: customName,
            posts: defaultPosts
       });

      list.save();
      res.redirect("/" + customName);
      } else {
      //existing list
      res.render("list", {listTitle: foundList.name, newTodos: foundList.posts});
    }
      
    } 
  });
});


app.listen(process.env.PORT || 3000, function()  {
  console.log("Server is running on Port: 3000.");
});
