// initialize express
const express = require('express');
const employeeRouter = express.Router();

// consigure sqlite
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// STACKS
// get all saved menus
const retrieveAllSavedMenus = (req, res, next) => {
  let menus = {};
  db.all("SELECT * FROM Menu;", (err, rows) => {
    if(err){
      res.status(500).send(err);
    }else{
      res.status(200).send({ menus: rows });
    }
  });
}

// retrieve all menu items given a valid menu id
const retrieveAllMenuitems = (req, res, next) => {
  let menuItems = {};
  let none = [];
  db.all("SELECT * FROM Menuitem WHERE menu_id = $id;", {$id: req.params.menuId}, (err, rows) => {
    if(err){
      res.status(500).send();
    }else if(rows[0] == null){
      db.get("SELECT * FROM Menu WHERE id = $id;", {$id: req.params.menuId}, (err, row) => {
        if(row === undefined){
          res.status(404).send();
        }else {
          res.send({ menuItems: none });
        }
      });
    }else{
      res.status(200).send({ menuItems: rows });
    }
  });
}

// retrieve a menu given a valid menu id
const retrieveMenuById = (req, res, next) => {
  let menu = {};
  db.get("SELECT * FROM Menu WHERE id = $id;", {$id: req.params.menuId}, (err, row) => {
    if(err){
      res.status(500).send(err);
    }else if(row === undefined){
        res.status(404).send();
    }else{
      res.status(200).send({ menu: row });
    }
  });
}

// verify required fields to create a menu
const menuRequiredFields = (req, res, next) => {
  const newMenu = req.body.menu;
  if(!(newMenu.hasOwnProperty('title') && newMenu['title'])){
    res.status(400).send();
  }else{
    next();
  }
}

// verify required fields to create a menuitem
const menuitemRequiredFields = (req, res, next) => {
  const newMenuitem = req.body.menuItem;
  if(!(newMenuitem.hasOwnProperty('name') && newMenuitem['name']) || !(newMenuitem.hasOwnProperty('inventory') && newMenuitem['inventory']) || !(newMenuitem.hasOwnProperty('price') && newMenuitem['price'])){
    res.status(400).send();
  }else{
    next();
  }
}

// create a new menu
const createNewMenu = (req, res, next) => {
  const newMenu = req.body.menu;
  let menu = {};
    db.run("INSERT INTO Menu (title) VALUES ($title);", {$title: newMenu.title}, function(err) {
      if(err){
        res.status(500).send(err);
      }else{
        db.get("SELECT * FROM Menu WHERE id = $id;", {$id: this.lastID}, (err, nmenu) => {
          res.status(201).send({ menu: nmenu });
        });
      }
    });
}

// create new menutems given a valid menu id
const createNewMenuitem = (req, res, next) => {
  const newMenuitem = req.body.menuItem;
  let menuItem = {};
    db.run("INSERT INTO Menuitem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $id);", {
      $name: newMenuitem.name,
      $description: newMenuitem.description,
      $inventory: newMenuitem.inventory,
      $price: newMenuitem.price,
      $id: req.params.menuId
    }, function(err) {
      if(err){
        res.status(500).send(err);
      }else{
        db.get("SELECT * FROM Menuitem WHERE id = $id;", {$id: this.lastID}, (err, nmenuitem) => {
          res.status(201).send({ menuItem: nmenuitem });
        });
      }
    });
}

// validate menu exists given an id
const validateMenu = (req, res, next) => {
  db.get("SELECT * FROM Menu WHERE id = $id;", {$id: req.params.menuId}, (err, row) => {
    if(err){
      res.status(500).send(err);
    }else if(row === undefined){
        res.status(404).send();
    }else{
      next();
    }
  });
}

// validate menuitem exists given an id
const validateMenuitem = (req, res, next) => {
  db.get("SELECT * FROM Menuitem WHERE id = $id;", {$id: req.params.menuItemId}, (err, row) => {
    if(err){
      res.status(500).send(err);
    }else if(row === undefined){
        res.status(404).send();
    }else{
      next();
    }
  });
}

// update a menu given a valid id
const updateMenu = (req, res, next) => {
  const updatedMenu = req.body.menu;
  let menu = {};
  db.run("UPDATE Menu SET title = $title WHERE id = $id;", {$title: updatedMenu.title, $id: req.params.menuId}, function(err) {
      if(err){
        res.status(500).send();
      } else {
        db.get("SELECT * FROM Menu WHERE id = $id;", {$id: req.params.menuId}, (err, umenu) => {
          res.status(200).send({ menu: umenu});
      });
    }
  });
}

// update a menuitem given a valid id
const updateMenuitem = (req, res, next) => {
  const updatedMenuitem = req.body.menuItem;
  let menuItem = {};
  db.run("UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price WHERE id = $id;", {
    $name: updatedMenuitem.name,
    $description: updatedMenuitem.description,
    $inventory: updatedMenuitem.inventory,
    $price: updatedMenuitem.price,
    $id: req.params.menuItemId
  }, function(err) {
      if(err){
        res.status(500).send();
      } else {
        db.get("SELECT * FROM Menuitem WHERE id = $id;", {$id: req.params.menuItemId}, (err, umenuitem) => {
          res.status(200).send({ menuItem: umenuitem});
      });
    }
  });
}

// delete a menu given a valid id
const deleteMenu = (req, res, next) => {
  db.all("SELECT * FROM Menuitem WHERE menu_id = $id;", {$id: req.params.menuId}, (err, rows) => {
    if(err){
        res.status(500).send(err);
    }else if(rows[0] != null){
      res.status(400).send();
    }else{
      db.run("DELETE FROM Menu WHERE id = $id;", {$id: req.params.menuId}, function(err) {
          if(err){
            res.status(500).send();
          } else {
            res.status(204).send();
        }
      });
    }
  });
}

// delete a menuitem given a valid id
const deleteMenuitem = (req, res, next) => {
  db.run("DELETE FROM Menuitem WHERE id = $id;", {$id: req.params.menuItemId}, function(err) {
      if(err){
        res.status(500).send();
      } else {
        res.status(204).send();
    }
  });
}

// export the functions
module.exports = {
  retrieveAllSavedMenus,
  retrieveAllMenuitems,
  retrieveMenuById,
  menuRequiredFields,
  menuitemRequiredFields,
  createNewMenu,
  createNewMenuitem,
  validateMenu,
  validateMenuitem,
  updateMenu,
  updateMenuitem,
  deleteMenu,
  deleteMenuitem
}
