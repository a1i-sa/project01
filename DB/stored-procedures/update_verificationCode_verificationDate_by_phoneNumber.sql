USE `ai2`;
DROP PROCEDURE IF EXISTS update_verificationCode_verificationDate_by_phoneNumber;
DELIMITER $$
CREATE PROCEDURE update_verificationCode_verificationDate_by_phoneNumber(IN verCode INT , IN verDate DATETIME , IN phone VARCHAR(11))
BEGIN
     UPDATE `users` SET verificationCode=verCode,verificationDate=verDate WHERE phoneNumber=phone;
END $$
DELIMITER ;