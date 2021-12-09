require("dotenv").config({ path: "./.env" });
const inquirer = require("inquirer");
require("./services/utils");
const mysql = require("mysql2/promise");

// create the connection to database
const pool = mysql.createPool({
  host: process.env.dbUrl,
  port: process.env.dbPort,
  user: process.env.dbuser,
  database: process.env.defaultDatabase,
  password: process.env.dbuserPassword,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const choices = [
  "View all departments",
  "View all roles",
  "View all employees",
  "Add a department",
  "Add a role",
  "Add an employee",
  "Update an employee role",
  "Exit",
];

main = async () => {
  while (true) {
    let answer = await inquirer.prompt({
      name: "action",
      type: "rawlist",
      message: "What do you want to do?",
      pageSize: 10,
      choices: choices,
    });

    if (answer.action === "Exit") {
      // End the mysql connection pool when exit
      pool.end();
      break;
    }

    switch (answer.action) {
      case "View all departments":
        await viewAllDepartments(pool);
        break;
      case "View all roles":
        await viewAllRoles(pool);
        break;
      case "View all employees":
        await viewAllEmployees(pool);
        break;
      case "Add a department":
        await addDepartment(pool);
        break;
      case "Add a role":
        await addRole(pool);
        break;
      case "Add an employee":
        await addEmployee(pool);
        break;
      case "Update an employee role":
        await updateEmployeeRole(pool);
        break;
      default:
    }
  }
};

main();
