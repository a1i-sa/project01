USE `ai2`;
DROP PROCEDURE IF EXISTS delete_by_id;
DELIMITER $$
CREATE PROCEDURE delete_by_id(IN id INT)
BEGIN
     DELETE FROM `users` WHERE user_id=id;
END $$
DELIMITER ;
