USE `ai2`;
DROP PROCEDURE IF EXISTS update_user_refreshToken_by_id;
DELIMITER $$
CREATE PROCEDURE update_user_refreshToken_by_id(IN refresh VARCHAR(255),IN id INT)
BEGIN
     UPDATE `users` SET refreshToken=refresh WHERE user_id=id;
END $$
DELIMITER ;