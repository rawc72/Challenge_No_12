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

updateEmployeeRole = async(pool) => {
    // Query database to get all employees
    const allEmployees =
        "select id, first_name, last_name, role_id from employee";
    const result = await pool.query(allEmployees);

    // No employee found
    if (result[0].length === 0) {
        console.log("!!!!! No employee exists !!!!!");
        return;
    }

    // Get all employees
    const employees = result[0].map((employee) => ({
        id: employee.id,
        name: employee.first_name + " " + employee.last_name,
        roleId: employee.role_id,
    }));

    const employeeChoices = employees.map((employee) => employee.name);

    let answer = await inquirer.prompt([{
        name: "employeeName",
        type: "list",
        message: "Who do you want to change role?",
        choices: [...employeeChoices],
    }, ]);

    const employeeId = employees.filter(
        (employee) => employee.name === answer.employeeName
    )[0].id;

    const oldRoleId = employees.filter(
        (employee) => employee.name === answer.employeeName
    )[0].roleId;

    const getOtherRoles = "select id, title from role where id != ?";
    const parms = [oldRoleId];

    const roleResult = await pool.query(getOtherRoles, parms);

    if (roleResult[0].length === 0) {
        console.log("!!!!! No other role to choose !!!!!");
        return;
    }

    const roleChoices = roleResult[0].map((role) => role.title);

    let answer2 = await inquirer.prompt([{
        name: "newRole",
        type: "list",
        message: "What's the new role for " + answer.employeeName + "?",
        choices: [...roleChoices],
    }, ]);

    const newRoleId = roleResult[0].filter(
        (role) => role.title === answer2.newRole
    )[0].id;

    const updateRole = "update employee set role_id = ? where id = ?";

    const uParms = [newRoleId, employeeId];

    try {
        await pool.query(updateRole, uParms);
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        console.log(
            "!!  Update employee " +
            answer.employeeName +
            " with new role " +
            answer2.newRole
        );
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    } catch (error) {
        console.log("Update employee role error: " + JSON.stringify(error));
    }
};