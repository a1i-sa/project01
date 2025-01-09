USE `ai2`;
DROP PROCEDURE IF EXISTS get_user_by_phoneNumber;
DELIMITER $$
CREATE PROCEDURE get_user_by_phoneNumber(IN user_phoneNumber VARCHAR(11))
BEGIN
     SELECT * FROM `users` WHERE user_phoneNumber=phoneNumber;
END $$
DELIMITER ;



