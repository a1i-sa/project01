USE `ai2`;
DROP PROCEDURE IF EXISTS update_user_refreshToken_by_phoneNumber;
DELIMITER $$
CREATE PROCEDURE update_user_refreshToken_by_phoneNumber(IN refresh VARCHAR(255),IN phone VARCHAR(11))
BEGIN
     UPDATE `users` SET refreshToken=refresh WHERE phoneNumber=phone;
END $$
DELIMITER ;