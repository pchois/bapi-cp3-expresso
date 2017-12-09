// initialize express
const express = require('express');
const employeeRouter = express.Router();
const bodyParser = require('body-parser');
const morgan = require('morgan');

// set body-parser
employeeRouter.use(bodyParser.json());

// set morgan (logging)
employeeRouter.use(morgan('tiny'));

// STACK
const employeeStack = require('./employeeStack.js');

// ROUTES
// get all employees
employeeRouter.get('/', employeeStack.retrieveAllActiveEmployees);

// create a new employee
employeeRouter.post('/', employeeStack.employeeRequiredFields, employeeStack.createNewEmployee);

// get employee given a valid id
employeeRouter.get('/:employeeId', employeeStack.retrieveActiveEmployeeById);

// update employee given a valid id
employeeRouter.put('/:employeeId', employeeStack.validateEmployee, employeeStack.employeeRequiredFields,  employeeStack.updateEmployee);

// delete an employee given a valid id
employeeRouter.delete('/:employeeId', employeeStack.validateEmployee, employeeStack.deleteEmployee);

// get all saved timesheets for an employee given a valid id
employeeRouter.get('/:employeeId/timesheets', employeeStack.retrieveAllTimesheets);

// create a new timesheet for an employee given a valid id
employeeRouter.post('/:employeeId/timesheets', employeeStack.validateEmployee, employeeStack.timesheetRequiredFields, employeeStack.createNewTimesheet);

// update a timesheet for an employee given a valid id
employeeRouter.put('/:employeeId/timesheets/:timesheetId', employeeStack.validateEmployee, employeeStack.validateTimesheet, employeeStack.timesheetRequiredFields, employeeStack.updateTimesheet);

// delete a timesheet for an employee given a valid id
employeeRouter.delete('/:employeeId/timesheets/:timesheetId', employeeStack.validateEmployee, employeeStack.validateTimesheet, employeeStack.deleteTimesheet);

// export employee Router
module.exports = employeeRouter;
