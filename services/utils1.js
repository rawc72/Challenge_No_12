const inquirer = require("inquirer");
const cTable = require("console.table");

viewAllDepartments = async(pool) => {
    const selectAllDepartments = "select * from department";

    try {
        const result = await pool.query(selectAllDepartments);
        const table = cTable.getTable(result[0]);
        console.log("");
        console.log(table);
    } catch (error) {
        console.log(
            "Retrieve from table department error: " + JSON.stringify(error)
        );
    }
};

viewAllRoles = async(pool) => {
    const selectAllRoles = "select * from role";

    try {
        const result = await pool.query(selectAllRoles);
        const table = cTable.getTable(result[0]);
        console.log("");
        console.log(table);
    } catch (error) {
        console.log("Retrieve from table role error: " + JSON.stringify(error));
    }
};

viewAllEmployees = async(pool) => {
    const selectAllEmployees = "select * from employee";

    try {
        const result = await pool.query(selectAllEmployees);
        const table = cTable.getTable(result[0]);
        console.log("");
        console.log(table);
    } catch (error) {
        console.log("Retrieve from table employee error: " + JSON.stringify(error));
    }
};

//Adding department.
addDepartment = async(pool) => {
    let answer = await inquirer.prompt({
        name: "name",
        message: "What's the department name?",
    });

    const insertDepartment = "insert into department (name) values(?)";

    const parms = [answer.name];

    try {
        await pool.query(insertDepartment, parms);
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        console.log("!!  New department " + answer.name + " inserted to database.");
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    } catch (error) {
        console.log("Insert new department error: " + JSON.stringify(error));
    }
};