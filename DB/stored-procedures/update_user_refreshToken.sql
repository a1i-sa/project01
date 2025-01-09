USE `ai2`;
DROP PROCEDURE IF EXISTS update_user_refreshToken;
DELIMITER $$
CREATE PROCEDURE update_user_refreshToken(IN refresh VARCHAR(255), IN token VARCHAR(255))
BEGIN
     UPDATE `users` SET refreshToken=refresh WHERE refreshToken=token; 
END $$
DELIMITER ;