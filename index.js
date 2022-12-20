const { prompt } = require('inquirer');
// Import and require mysql2
const mysql = require('mysql2');
//to print table 
const cTable = require('console.table');
const db = require('./config/connection');

//generate prompts the init question
const questions = [
    {
        type: 'list',
        name:'toDo',
        message: ' What would you like to do?',
        choices: [  'View All Departments',
                    'View All Roles',
                    'View All Employees', 
                    'View Budget of Every Department',
                    'Add a Department',
                    'Add a Role', 
                    'Add an Employee',
                    'Update an Employee Role',
                    'Update an Employee Manager',
                    'Delete an Employee',
                    'Delete a Role',
                    'Delete a Department',
                    'End Session'],
    },
];

//prompt for adding department
const addDepartment = [
    {
        type: 'input',
        name:'newDepartment',
        message: ' What is the name of the new Department?',
        validate: newDepartment =>(newDepartment =='')? 'Please do not leave empty.': true,
    },
];


//FUNCTIONS
//build object on prompts
function init(){

    prompt(questions).then(async ({toDo}) => {
        try{
            //figure out what to do
            //check if view all departments
            if (toDo=='View All Departments'){
                viewAllDepartments();
            };

            //check if view all roles
            if (toDo=='View All Roles'){
                viewAllRoles();
            };

            //check if view all employees
            if (toDo=='View All Employees'){
                viewAllEmployees();
            };

            //check if view budget of every department
            if(toDo=='View Budget of Every Department'){
                viewBudgetDept();
            };//close view budget every dept

            //check if user wants to add a department
            if (toDo=='Add a Department'){
                addADepartment();
            };//add dept if
                
            //check if user wants to add role
            if (toDo=='Add a Role'){
                addARole();
            }; //add role if
            
            //Add employee
            if (toDo=='Add an Employee'){
                addAnEmployee();
            };//close add employee if

            //if for updating employee
            if (toDo=='Update an Employee Role'){
                updateEmployeeRole();
            }; //close updating employee if

            //if for updating employee Manager
            if (toDo=='Update an Employee Manager'){
                updateEmployeeManager();
            };//close updating employee manager if

            //if to delete Employee
            if (toDo=='Delete an Employee'){
                deleteEmployee();
            };//close delete employee if

            //if delete Role
            if (toDo=='Delete a Role'){
                deleteRole();
            };//close delete role

            //if to delete Department
            if (toDo=='Delete a Department'){
                deleteDepartment();
            };//close delete role

            //if for ending session
            if (toDo=='End Session'){
                process.exit();
            }; //close end session if

           
        }//close try
        //catch all error
        catch (error){
            console.error("Error: "+error);
        }//close catch
       
    
    });

}    //init

console.log('WELCOME TO EMPLOYEE TRACKER!');

// Function call to initialize app
init();


//FUNCTION LIBRARY

//FUNCTION to view all departments
async function viewAllDepartments(){
    let [ rows ] = await db.promise().query(
        `SELECT department.name AS department, department.id AS department_id 
         FROM department
         ORDER BY department.name ASC;`);
    console.table(rows);
    //go back to main question menu
    init();
} //close view all departments

//FUNCTION to view all roles
async function viewAllRoles(){
    let [ rows ] = await db.promise().query(
        `SELECT role.title AS job_title, role.id AS role_id, department.name AS department, role.salary AS salary_$ 
         FROM role INNER JOIN department 
         ON role.department_id=department.id
         ORDER BY role.title ASC;`);
    console.table(rows);
    //go back to main question menu
    init();
} //close view all roles

//FUNCTION to view all employees
async function viewAllEmployees(){
    let [ rows ] = await db.promise().query(
        `SELECT employee.id AS employee_id, CONCAT(employee.last_name,', ', employee.first_name) AS employee, role.title AS job_title,
         department.name AS department,role.salary AS salary_$, CONCAT(e2.last_name,', ',e2.first_name) AS manager
         FROM employee
         JOIN role ON employee.role_id=role.id
         JOIN department ON role.department_id=department.id
         LEFT JOIN employee e2 ON employee.manager_id=e2.id
         ORDER BY employee.id;`);
    console.table(rows);
    //go back to main question menu
    init();
}//close view all employees

//FUNCTION to view budget of every department
async function viewBudgetDept(){
    let[rows]=await db.promise().query(
        `SELECT department.name AS Department, SUM(role.salary) AS 'Budget Total' 
         FROM employee 
         LEFT JOIN role ON employee.role_id=role.id 
         LEFT JOIN department ON role.department_id=department.id 
         GROUP BY department.name
         ORDER BY department.name ASC;`
    );
    console.table(rows);
    //go back to main question menu
    init();
}//close view budget of every department

//FUNCTION to add a department
async function addADepartment(){
    //prompt for new department
    prompt(addDepartment).then(async ({newDepartment})=>{
        
        const sql=`INSERT INTO department (name) VALUES (?)`;
        
        await db.promise().query(sql,newDepartment, function (err,result){
            if(err){
                console.error(err);
            }
            
            
        }).then(()=>{

            console.log(`The ${newDepartment} department successfully added!`);
            //go back to main question menu
            init();});
            
    })
} //close  add a dept

//FUNCTION to add a role
async function addARole(){
    //function to query for department choices for add role prompt
    const sql =`SELECT name, id AS value FROM department`;

    await db.promise().query(sql)
        .then((data)=>{
            
            let departmentChoices=data[0];

             //prompt
            prompt([
            {      
                type: 'input',
                name:'newRole',
                message: '\n What is the new role\'s name?',
                validate: newRole =>(newRole =='')? 'Please do not leave empty.': true,
            },
            {      
                type: 'input',
                name:'roleSalary',
                message: 'What is the new role\'s salary?',
                validate: salary =>(salary =='')? 'Please do not leave empty.': true,
            },
            {      
                type: 'list',
                name:'roleDepartment',
                message: 'Which department does this role belong to?',
                choices: departmentChoices,
            },
            ]).then(async ({newRole, roleSalary, roleDepartment})=>{

            //insert into database
            const sql=`INSERT INTO role (title,salary,department_id) VALUES (?,?,?)`;
        
            await db.promise().query(sql,[newRole,roleSalary,roleDepartment], function (err,result){
                if(err){
                    console.error(err);
                }
                
            }).then(()=>{
                //log the result of query
                console.log(`The ${newRole} role has been successfully added in the ${roleDepartment} department !`);
                
                //go back to main question menu
                init();     
            });
          
            })
        });//query for addRole
} //close add a role

//FUNCTION to add an employee
async function addAnEmployee(){
    //function to query for role choices
    const sqlRole =`SELECT title AS name, id AS value FROM role`;
    const sqlManager=`SELECT CONCAT(employee.last_name,', ',employee.first_name,' - ',role.title) AS name, employee.id AS value FROM employee INNER JOIN role ON employee.role_id=role.id;`;

    await db.promise().query(sqlRole)
        .then((role)=>
        {
            let roleChoices=role[0];
            //prompt for first details of employee and add to database
            prompt([
                {      
                    type: 'input',
                    name:'firstName',
                    message: ' What is the new employee\'s first name?',
                    validate: firstName =>(firstName =='')? 'Please do not leave empty.': true,
                },
                {      
                    type: 'input',
                    name:'lastName',
                    message: ' What is the new employee\'s last name?',
                    validate: lastName =>(lastName =='')? 'Please do not leave empty.': true,
                },
                {      
                    type: 'list',
                    name:'employeeRole',
                    message: ' What is the new employee\'s role?',
                    choices:roleChoices,
                },
                ]).then(async (employeePt1)=>{
                //query for manager names and prompt
                await db.promise().query(sqlManager).then((data)=>{
                    let manager=data[0];
                    prompt({      
                        type: 'list',
                        name:'managerName',
                        message: ' Who is the new employee\'s manager?',
                        choices:manager,
                    },).then(async (managerName)=>{
                        //add employee 
                        console.log(employeePt1,' ',managerName) ;
                        //query to insert into database
                        const sqlEmployee=`INSERT INTO employee (first_name,last_name,role_id,manager_id) VALUES (?,?,?,?)`;
                        //add to database
                        await db.promise().query(sqlEmployee,[employeePt1.firstName,employeePt1.lastName,employeePt1.employeeRole,managerName.managerName], function (err,result){
                            if(err){
                                console.error(err);
                            }
                            
                        }).then(()=>{
                            //log the result of query
                            console.log(`The new employee ${employeePt1.lastName}, ${employeePt1.firstName} has been successfully added in the database as ${employeePt1.employeeRole}.`);
                            
                            //go back to main question menu
                            init();     
                        });
                        
                    }); // close for manager name prompt

                });//query for manager
            });   //close then for after prompt   
        }) //close for role query
} //close add an employee

//FUNCTION to update employee role
async function updateEmployeeRole(){
    //query to select employee for prompt
    const sqlEmployee=`SELECT CONCAT(employee.last_name,', ',employee.first_name,' - ',role.title) AS name, employee.id AS value FROM employee INNER JOIN role ON employee.role_id=role.id;`;

    //query database for employee names
    await db.promise().query(sqlEmployee).then((data)=>{
        let employeeChoice=data[0];

        prompt({     
            type: 'list',
            name:'employeeID',
            message: ' Which employee\'s role will be updated?',
            choices:employeeChoice,
        },).then(async (employee)=>{
                console.log(employee.employeeID);
                let sql = `SELECT role.title AS name, role.id AS value FROM role;`;

                await db.promise().query(sql).then((roles)=>{
                    let roleChoice=roles[0];

                    prompt({     
                        type: 'list',
                        name:'newRole',
                        message: `Which will be the new role?`,
                        choices:roleChoice,
                    },).then(async (data)=>{

                        console.log(data.newRole,' ',employee.employeeID);

                        //query to update employee
                        const sqlUpdate=    `UPDATE employee
                                            SET role_id=?
                                            WHERE id=?;`;
                        
                        //db query
                        await db.promise().query(sqlUpdate,[data.newRole,employee.employeeID],function (err,result){
                            if(err){
                                console.error(err);
                            }
                        })//close db query update employee
                        .then(()=>{
                            //log the result of query
                            console.log(`The employee\'s role has been updated.`);
                            
                            //go back to main question menu
                            init();  
                        })
                    })
                }) 
            
            
        })//close for prompt
    });//close query for employee
}//close update employee role

//FUNCTION to update employee manager
async function updateEmployeeManager(){
    //query to select employee for prompt
    const sqlEmployee=`SELECT CONCAT(employee.last_name,', ',employee.first_name,' - ',role.title) AS name, employee.id AS value FROM employee INNER JOIN role ON employee.role_id=role.id;`;

    //query database for employee names
    await db.promise().query(sqlEmployee).then((data)=>{
        const employeeChoice=data[0];

        prompt([{     
            type: 'list',
            name:'employeeID',
            message: ' Which employee\'s manager will be updated?',
            choices:employeeChoice,
            },
            {     
            type: 'list',
            name:'newManager',
            message: `Who will be the new manager?`,
            choices:employeeChoice,
            },]).then(async (data)=>{

                //query to update employee
                const sqlUpdate=    `UPDATE employee
                                    SET manager_id=?
                                    WHERE id=?;`;
                
                //db query
                await db.promise().query(sqlUpdate,[data.newManager,data.employeeID],function (err,result){
                    if(err){
                        console.error(err);
                    }
                })//close db query update employee
                .then(()=>{
                    //log the result of query
                    console.log(`The employee\'s manager has been changed.`);
                    
                    //go back to main question menu
                    init();  
                });
        })//close for prompt
    });//close query for employee
}//close update employee manager

//FUNCTION to delete employee
async function deleteEmployee(){
    //mysql for finding all employees
    const sqlEmployee=`SELECT CONCAT(employee.last_name,', ',employee.first_name,' - ',role.title) AS name, employee.id AS value FROM employee INNER JOIN role ON employee.role_id=role.id;`;

    await db.promise().query(sqlEmployee)
        .then((employee)=>{
            //store choices
            let empChoice=employee[0];

            prompt(
                {
                    type:'list',
                    name:'Emp',
                    message:' Which employee will be deleted from the database?',
                    choices: empChoice,
                },
            ).then(async (data)=>{
               
                //query for deletion
                const sqlDel=   `DELETE FROM employee
                                 WHERE id=${data.Emp};`;
                await db.promise().query(sqlDel).then(()=>{
                    //log result
                    console.log(`The employee with id:${data.Emp} was deleted.`);

                    //go back to main question menu
                    init();    
                })
            })
        })
}//close delete employee

//FUNCTION to delete role
async function deleteRole(){
    //mysql for finding all roles
    const sqlRole=`SELECT role.title AS name, role.id AS value FROM role;`;

    await db.promise().query(sqlRole)
        .then((roles)=>{
            //store choices
            let roleChoice=roles[0];

            prompt(
                {
                    type:'list',
                    name:'roleDel',
                    message:' Which role will be deleted from the database?',
                    choices: roleChoice,
                },
            ).then(async (data)=>{
                console.log(data.roleDel);
                //query for deletion
                const sqlDel=   `DELETE FROM role
                                 WHERE id=${data.roleDel};`;
                await db.promise().query(sqlDel).then(()=>{
                    //log result
                    console.log(`The role with id number ${data.Emp} was deleted.`);

                    //go back to main question menu
                    init();    
                })
            })
        })
}//close delete role

//FUNCTION to delete department
async function deleteDepartment(){
    //mysql for finding all department
    const sqlDept=`SELECT department.name, department.id AS value FROM department;`;

    await db.promise().query(sqlDept)
        .then((dept)=>{
            //store choices
            let deptChoice=dept[0];

            prompt(
                {
                    type:'list',
                    name:'deptDel',
                    message:' Which department will be deleted from the database?',
                    choices: deptChoice,
                },
            ).then(async (data)=>{
                console.log(data.deptDel);
                //query for deletion
                const sqlDel=   `DELETE FROM department
                                 WHERE id=${data.deptDel};`;
                await db.promise().query(sqlDel).then(()=>{
                    //log result
                    console.log(`The department with id number ${data.deptDel} was deleted.`);

                    //go back to main question menu
                    init();    
                })
            })
        })
}//close delete role