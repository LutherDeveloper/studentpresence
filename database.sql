CREATE DATABASE attendance_system;
USE attendance_system;

CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50),
    name VARCHAR(100),
    time DATETIME,
    status VARCHAR(20)
);