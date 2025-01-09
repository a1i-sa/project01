USE `ai2`;

DROP PROCEDURE IF EXISTS update_user_by_id;

DELIMITER $$

CREATE PROCEDURE update_user_by_id(
    IN name VARCHAR(45),
    IN email VARCHAR(255),
    IN role ENUM("ADMIN", "ENGINEER", "INTERN"),
    IN phoneNumber VARCHAR(11),
    IN password VARCHAR(255),
    IN id INT
)
BEGIN
    -- Update only non-NULL and non-empty fields

    IF name IS NOT NULL AND name != '' THEN
        UPDATE `users` SET name = name WHERE user_id = id;
    END IF;

    IF email IS NOT NULL AND email != '' THEN
        UPDATE `users` SET email = email WHERE user_id = id;
    END IF;

    IF role IS NOT NULL AND role != '' THEN
        UPDATE `users` SET role = role WHERE user_id = id;
    END IF;
    IF phoneNumber IS NOT NULL AND phoneNumber != '' THEN
        UPDATE `users` SET phoneNumber = phoneNumber WHERE user_id = id;
    END IF;
    IF password IS NOT NULL AND password != '' THEN
        UPDATE `users` SET password = password WHERE user_id = id;
    END IF;
END $$

DELIMITER ;