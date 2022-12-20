INSERT INTO department (name)
VALUES  ("Sales"),
        ("Human Resources"),
        ("Operations"),
        ("Finance"),
        ("Executive");

INSERT INTO role (title, salary, department_id)
VALUES  ("Salesperson",100000,1),
        ("Human Resources Manager", 100000,2),
        ("Human Resources Coordinator", 75000,2),
        ("Operations Manager", 100000,3),
        ("Operations Coordinator", 85000,3),
        ("Operations Analyst", 75000,3),
        ("Financial Analyst",75000,4),
        ("Owner",200000,4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES  ("Keefee","Buster",8,NULL),
        ("Shania","Twain",1,2),
        ("Hanna","Junakus",2,8),
        ("Jordan","Miles",3,2),
        ("Karen","Kim",3,2),
        ("Olaf","Christensen",4,8),
        ("Jeremy","Lu",5,4),
        ("Harish","Natarajan",6,4),
        ("Bema","Sordodina",7,4);