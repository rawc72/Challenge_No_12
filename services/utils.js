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

//Adding employees.
addEmployee = async(pool) => {
    // Query database to get all roles
    const findRole = "select id, title from role";
    const result = await pool.query(findRole);

    // Query database to get all managers
    const findManager =
        "select id, first_name, last_name from employee where manager_id is null";
    const managerResult = await pool.query(findManager);

    // No roles available
    if (result[0].length === 0) {
        console.log(
            "!!!!! No role found, can't add employee. Please add role first !!!!!"
        );
        return;
    }

    // Adding manager?
    let answer1 = await inquirer.prompt([{
        name: "isManager",
        type: "list",
        message: "Is he/she a manager?",
        choices: ["Yes", "No"],
    }, ]);

    // Not adding manager, we need at least one manager to add the new employee
    if (answer1.isManager === "No" && managerResult[0].length === 0) {
        console.log(
            "!!!!! No manager found, can't add employee. Please add manager first !!!!!"
        );
        return;
    }

    // Get all managers
    const managers = managerResult[0].map((manager) => ({
        id: manager.id,
        name: manager.first_name + " " + manager.last_name,
    }));

    // Construct manager name array
    const managerChoices = managers.map((manager) => manager.name);

    const roles = result[0].map((role) => ({
        id: role.id,
        title: role.title,
    }));

    const roleChoices = result[0].map((role) => role.title);

    let questions = [];

    questions.push({
        name: "firstName",
        message: "What's the employee's first name?",
    });

    questions.push({
        name: "lastName",
        message: "What's the employee's last name?",
    });

    questions.push({
        name: "role",
        type: "list",
        message: "What's the employee's role?",
        choices: [...roleChoices],
    });

    if (answer1.isManager === "No") {
        questions.push({
            name: "manager",
            type: "list",
            message: "What's the employee's manager?",
            choices: [...managerChoices],
        });
    }

    // Collect employee's information, if not manager, ask for his manager
    let answer2 = await inquirer.prompt(questions);

    // Based on the answer get role id
    const roleId = roles.filter((role) => role.title === answer2.role)[0].id;

    // Based on the answer get manager id, if he is manager, the field is null
    const managerId =
        answer1.isManager === "No" ?
        managers.filter((manager) => manager.name === answer2.manager)[0].id :
        null;

    console.log(managers);
    console.log(managerId);
    const insertEmployee =
        "insert into employee (first_name, last_name, role_id, manager_id) values(?,?,?,?)";

    const parms = [answer2.firstName, answer2.lastName, roleId, managerId];

    try {
        await pool.query(insertEmployee, parms);
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        console.log(
            "!!! New employee " +
            answer2.firstName +
            " " +
            answer2.lastName +
            " inserted to database."
        );
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    } catch (error) {
        console.log("Insert new employee error: " + JSON.stringify(error));
    }
};

//Adding roles.
addRole = async(pool) => {
    const findDepartment = "select id, name from department";
    const result = await pool.query(findDepartment);

    if (result[0].length === 0) {
        console.log(
            "!!!!! No department found, can't add role. Please add role first !!!!!"
        );
        return;
    }

    const departments = result[0].map((department) => ({
        id: department.id,
        name: department.name,
    }));

    const departmentChoices = result[0].map((department) => department.name);

    let questions = [];

    questions.push({
        name: "title",
        message: "What's the role's title?",
    });

    questions.push({
        name: "salary",
        message: "What's the role's salary?",
    });

    questions.push({
        name: "department",
        type: "list",
        message: "What's the role's department?",
        choices: [...departmentChoices],
    });

    let answer = await inquirer.prompt(questions);

    const departmentId = departments.filter(
        (department) => department.name === answer.department
    )[0].id;

    const insertRole =
        "insert into role (title, salary, department_id) values(?,?,?)";

    const parms = [answer.title, answer.salary, departmentId];

    try {
        await pool.query(insertRole, parms);
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        console.log("!!! New role " + answer.title + " inserted to database.");
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    } catch (error) {
        console.log("Insert new role error: " + JSON.stringify(error));
    }
};