USE `ai2`;
DROP PROCEDURE IF EXISTS get_user_by_id;
DELIMITER $$
CREATE PROCEDURE get_user_by_id(IN id INT)
BEGIN
     SELECT * FROM `users` WHERE user_id=id;
END $$
DELIMITER ;