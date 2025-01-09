USE `ai2`;
DROP PROCEDURE IF EXISTS update_users_refreshToken_verificationDate_verificationCode;
DELIMITER $$
CREATE PROCEDURE update_users_refreshToken_verificationDate_verificationCode(IN refreshToken VARCHAR(255),IN verificationDate DATETIME,IN verificationCode INT, IN phone VARCHAR(11) )
BEGIN 
     UPDATE `users` SET refreshToken=refreshToken,verificationDate=verificationDate,verificationCode=verificationCode 
     WHERE phoneNumber=phone;
END $$
DELIMITER ;