const express = require('express');
const csvParser = require('csv-parser');
const fs = require('fs');
const fastcsv = require('fast-csv');
const path = require('path');

const app = express();
app.use(express.json());


const readCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
};

const writeCSV = (filePath, data) => {
  const ws = fs.createWriteStream(filePath);
  fastcsv
    .write(data, { headers: true })
    .pipe(ws);
};


const assignSecretSantas = (employees, previousAssignments) => {
    const assignments = [];
    const available = [...employees];
  
    employees.forEach((employee) => {
      let secretChild;
      let previousSecretChild = previousAssignments.find(
        (assignment) => assignment.Employee_EmailID.trim() === employee.Employee_EmailID.trim()
      )?.Secret_Child_EmailID;
  
      do {
        secretChild = available[Math.floor(Math.random() * available.length)];
      } while (
        secretChild.Employee_EmailID.trim() === employee.Employee_EmailID.trim() || 
        secretChild.Employee_EmailID.trim() === previousSecretChild 
      );
  
      available.splice(available.indexOf(secretChild), 1);
  
      assignments.push({
        Employee_Name: employee.Employee_Name ? employee.Employee_Name.trim() : "Unknown Name",  
        Employee_EmailID: employee.Employee_EmailID.trim(),
        Secret_Child_Name: secretChild.Employee_Name ? secretChild.Employee_Name.trim() : "Unknown Name", 
        Secret_Child_EmailID: secretChild.Employee_EmailID.trim(),
      });
    });
  
    return assignments;
  };
  
(async () => {
    try {
      const employeesFilePath = path.join(__dirname, 'Employee-List_1.csv');
      const previousAssignmentsFilePath = path.join(__dirname, 'Secret-Santa-Game-Result-2023_1.csv');
      
      const employees = await readCSV(employeesFilePath);
      const previousAssignments = await readCSV(previousAssignmentsFilePath);

      console.log("Employees Data:", employees);
      console.log("Previous Assignments:", previousAssignments);
  
      const newAssignments = assignSecretSantas(employees, previousAssignments);
      const outputFilePath = path.join(__dirname, 'new_secret_santa_assignments.csv');
      
      writeCSV(outputFilePath, newAssignments);
      console.log('Secret Santa assignments generated and saved to', outputFilePath);
    } catch (error) {
      console.error('An error occurred while generating assignments:', error);
    }
  })();
  
