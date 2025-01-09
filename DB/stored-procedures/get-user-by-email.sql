USE `ai2`;
DROP PROCEDURE IF EXISTS get_user_by_email;
DELIMITER $$
CREATE PROCEDURE get_user_by_email(IN user_email VARCHAR(255))
BEGIN
     SELECT * FROM `users` WHERE user_email=email;
END $$
DELIMITER ;



