// initialize express
const express = require('express');
const app = express();

// configure the PORT
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

// serve the site
app.use(express.static('public'));

// configure employee Router
const employeeRouter = require('./employeeRouter.js');
app.use('/api/employees', employeeRouter);

// configure menu router
const menuRouter = require('./menuRouter.js');
app.use('/api/menus', menuRouter);

// export app
module.exports = app;
