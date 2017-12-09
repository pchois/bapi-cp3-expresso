// initialize express
const express = require('express');
const employeeRouter = express.Router();

// consigure sqlite
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// STACKS
// retrieve all active employees
const retrieveAllActiveEmployees = (req, res, next) => {
  let employees = {};
  db.all("SELECT * FROM Employee WHERE is_current_employee = 1;", (err, rows) => {
    if(err){
      res.status(500).send(err);
    }else{
      res.status(200).send({ employees: rows });
    }
  });
}

// retrieve all timesheets given a valid employee id
const retrieveAllTimesheets = (req, res, next) => {
  let timesheets = {};
  let none = [];
  db.all("SELECT * FROM Timesheet WHERE employee_id = $id;", {$id: req.params.employeeId}, (err, rows) => {
    if(err){
      res.status(500).send();
    }else if(rows[0] == null){
      db.get("SELECT * FROM Timesheet WHERE id = $id;", {$id: req.params.employeeId}, (err, row) => {
        if(row === undefined){
          res.status(404).send();
        }else {
          res.send({ timesheets: none });
        }
      });
    }else{
      res.status(200).send({ timesheets: rows });
    }
  });
}

// retrieve an employee given a valid id
const retrieveActiveEmployeeById = (req, res, next) => {
  let employee = {};
  db.get("SELECT * FROM Employee WHERE id = $id AND is_current_employee = 1;", {$id: req.params.employeeId}, (err, row) => {
    if(err){
      res.status(500).send(err);
    }else if(row === undefined){
        res.status(404).send();
    }else{
      res.status(200).send({ employee: row });
    }
  });
}

// verify required fields to create an employees
const employeeRequiredFields = (req, res, next) => {
  const newEmployee = req.body.employee;
  if(!(newEmployee.hasOwnProperty('name') && newEmployee['name']) || !(newEmployee.hasOwnProperty('position') && newEmployee['position']) || !(newEmployee.hasOwnProperty('wage') && newEmployee['wage'])){
    res.status(400).send();
  }else{
    next();
  }
}

// verify required fields to create a timesheet
const timesheetRequiredFields = (req, res, next) => {
  const newTimesheet = req.body.timesheet;
  if(!(newTimesheet.hasOwnProperty('hours') && newTimesheet['hours']) || !(newTimesheet.hasOwnProperty('date') && newTimesheet['date']) || !(newTimesheet.hasOwnProperty('rate') && newTimesheet['rate'])){
    res.status(400).send();
  }else{
    next();
  }
}

// create a new employee
const createNewEmployee = (req, res, next) => {
  const newEmployee = req.body.employee;
  let employee = {};
    db.run("INSERT INTO Employee (name, position, wage) VALUES ($name, $position, $wage);", {
      $name: newEmployee.name,
      $position: newEmployee.position,
      $wage: newEmployee.wage
    }, function(err) {
      if(err){
        res.status(500).send(err);
      }else{
        db.get("SELECT * FROM Employee WHERE id = $id;", {$id: this.lastID}, (err, nemp) => {
          res.status(201).send({ employee: nemp });
        });
      }
    });
}

// create a new timesheet for an employee given a valid id
const createNewTimesheet = (req, res, next) => {
  const newTimesheet = req.body.timesheet;
  let timesheet = {};
    db.run("INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $id);", {
      $hours: newTimesheet.hours,
      $rate: newTimesheet.rate,
      $date: newTimesheet.date,
      $id: req.params.employeeId
    }, function(err) {
      if(err){
        res.status(500).send(err);
      }else{
        db.get("SELECT * FROM Timesheet WHERE id = $id;", {$id: this.lastID}, (err, nts) => {
          res.status(201).send({ timesheet: nts });
        });
      }
    });
}

// validate the employee id
const validateEmployee = (req, res, next) => {
  db.get("SELECT * FROM Employee WHERE id = $id AND is_current_employee = 1;", {$id: req.params.employeeId}, (err, row) => {
    if(err){
      res.status(500).send(err);
    }else if(row === undefined){
        res.status(404).send();
    }else{
      next();
    }
  });
}

// validate the timesheet id
const validateTimesheet = (req, res, next) => {
  db.get("SELECT * FROM Timesheet WHERE id = $id;", {$id: req.params.timesheetId}, (err, row) => {
    if(err){
      res.status(500).send(err);
    }else if(row === undefined){
        res.status(404).send();
    }else{
      next();
    }
  });
}

// update employee given a valid id
const updateEmployee = (req, res, next) => {
  const updatedEmployee = req.body.employee;
  let employee = {};
  db.run("UPDATE Employee SET name = $name, position = $position, wage = $wage WHERE id = $id;", {
    $name: updatedEmployee.name,
    $position: updatedEmployee.position,
    $wage: updatedEmployee.wage,
    $id: req.params.employeeId
  }, function(err) {
      if(err){
        res.status(500).send();
      } else {
        db.get("SELECT * FROM Employee WHERE id = $id;", {$id: req.params.employeeId}, (err, uemp) => {
          res.status(200).send({ employee: uemp});
      });
    }
  });
}

// update timesheet given a valid id
const updateTimesheet = (req, res, next) => {
  const updatedTimesheet = req.body.timesheet;
  let timesheet = {};
  db.run("UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date WHERE id = $id;", {
    $hours: updatedTimesheet.hours,
    $rate: updatedTimesheet.rate,
    $date: updatedTimesheet.date,
    $id: req.params.timesheetId
  }, function(err) {
      if(err){
        res.status(500).send();
      } else {
        db.get("SELECT * FROM Timesheet WHERE id = $id;", {$id: req.params.timesheetId}, (err, uts) => {
          res.status(200).send({ timesheet: uts});
      });
    }
  });
}

// delete an employee given a valid id
const deleteEmployee = (req, res, next) => {
  let employee = {};
  db.run("UPDATE Employee SET is_current_employee = 0 WHERE id = $id;", {$id: req.params.employeeId}, function(err) {
      if(err){
        res.status(500).send();
      } else {
        db.get("SELECT * FROM Employee WHERE id = $id;", {$id: req.params.employeeId}, (err, demp) => {
          res.status(200).send({ employee: demp});
      });
    }
  });
}

// delete a timesheet given a valid id
const deleteTimesheet = (req, res, next) => {
  db.run("DELETE FROM Timesheet WHERE id = $id;", {$id: req.params.timesheetId}, function(err) {
      if(err){
        res.status(500).send();
      } else {
        res.status(204).send();
    }
  });
}

// export the functions
module.exports = {
  retrieveAllActiveEmployees,
  retrieveAllTimesheets,
  retrieveActiveEmployeeById,
  employeeRequiredFields,
  timesheetRequiredFields,
  createNewEmployee,
  createNewTimesheet,
  validateEmployee,
  validateTimesheet,
  updateEmployee,
  updateTimesheet,
  deleteEmployee,
  deleteTimesheet
}
