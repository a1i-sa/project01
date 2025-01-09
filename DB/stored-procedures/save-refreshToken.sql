USE `ai2`;
DROP PROCEDURE IF EXISTS save_refreshToken;
DELIMITER $$
CREATE PROCEDURE save_refreshToken(IN phone VARCHAR(11),IN refresh VARCHAR(255) )
BEGIN 
     UPDATE `users` SET refreshToken=refresh
     WHERE phoneNumber=phone;
END $$
DELIMITER ;