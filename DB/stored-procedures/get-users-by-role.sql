USE `ai2`;
DROP PROCEDURE IF EXISTS get_users_by_role;
DELIMITER $$
CREATE PROCEDURE get_users_by_role(IN user_role ENUM('ADMIN','ENGINEER','INTERN'))
BEGIN
     SELECT * FROM `users` WHERE role=user_role;
END $$
DELIMITER ;