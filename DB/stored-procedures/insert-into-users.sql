USE `ai2`;
DROP PROCEDURE IF EXISTS insert_into_users;
DELIMITER $$
CREATE PROCEDURE insert_into_users(IN name VARCHAR(45) , IN email VARCHAR(255) , IN role ENUM("ADMIN","ENGINEER","INTERN"),IN phoneNumber VARCHAR(11),IN password VARCHAR(255))
BEGIN
      INSERT INTO `users`(name,email,role,phoneNumber,password) VALUES(name,email,role,phoneNumber,password);
END $$
DELIMITER ;
