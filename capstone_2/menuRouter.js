// initialize express
const express = require('express');
const menuRouter = express.Router();
const bodyParser = require('body-parser');
const morgan = require('morgan');

// set body-parser
menuRouter.use(bodyParser.json());

// set morgan (logging)
menuRouter.use(morgan('tiny'));

// STACK
const menuStack = require('./menuStack.js');

// ROUTES
// get all saved menus
menuRouter.get('/', menuStack.retrieveAllSavedMenus);

// create a new menu
menuRouter.post('/', menuStack.menuRequiredFields, menuStack.createNewMenu);

// get a menu given  valid id
menuRouter.get('/:menuId', menuStack.validateMenu, menuStack.retrieveMenuById);

// update a menu given a valid menu id
menuRouter.put('/:menuId', menuStack.menuRequiredFields, menuStack.updateMenu);

// delete menu given a valid id
menuRouter.delete('/:menuId', menuStack.deleteMenu);

// get all menu items
menuRouter.get('/:menuId/menu-items', menuStack.retrieveAllMenuitems);

// create menuitems given a valid menu id
menuRouter.post('/:menuId/menu-items', menuStack.menuitemRequiredFields, menuStack.createNewMenuitem);

// update a menuitem given a valid id
menuRouter.put('/:menuId/menu-items/:menuItemId', menuStack.validateMenuitem, menuStack.menuitemRequiredFields, menuStack.updateMenuitem);

// delete a menutiem given a vaid id
menuRouter.delete('/:menuId/menu-items/:menuItemId', menuStack.validateMenuitem, menuStack.deleteMenuitem);

// export menu Router
module.exports = menuRouter;
