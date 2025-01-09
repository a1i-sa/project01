USE `ai2`;
DROP PROCEDURE IF EXISTS get_user_by_refreshToken;
DELIMITER $$
CREATE PROCEDURE get_user_by_refreshToken(IN user_refreshToken VARCHAR(255))
BEGIN
     SELECT * FROM `users` WHERE user_refreshToken=refreshToken;
END $$
DELIMITER ;



