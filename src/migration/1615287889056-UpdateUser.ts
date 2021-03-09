import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateUser1615287889056 implements MigrationInterface {
    name = 'UpdateUser1615287889056'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `user` (`id` int NOT NULL AUTO_INCREMENT, `password` char(200) NOT NULL, `email` char(50) NULL, `postId` int NULL, `googleId` char(50) NULL, `loginGoogle` tinyint NOT NULL, `userpostsId` int NULL, UNIQUE INDEX `IDX_638bac731294171648258260ff` (`password`), UNIQUE INDEX `REL_4d79edb29ed31870be0b1c32d5` (`userpostsId`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `user_posts` (`id` int NOT NULL AUTO_INCREMENT, `userId` int NULL, UNIQUE INDEX `REL_9152833f45dc4ce32a5b0b016c` (`userId`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `posts` (`id` int NOT NULL AUTO_INCREMENT, `quantity` int NOT NULL, `postId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `user` ADD CONSTRAINT `FK_4d79edb29ed31870be0b1c32d5a` FOREIGN KEY (`userpostsId`) REFERENCES `user_posts`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `user_posts` ADD CONSTRAINT `FK_9152833f45dc4ce32a5b0b016c2` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `posts` ADD CONSTRAINT `FK_cdc670193be6ca43f590dbabcee` FOREIGN KEY (`postId`) REFERENCES `user_posts`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `posts` DROP FOREIGN KEY `FK_cdc670193be6ca43f590dbabcee`");
        await queryRunner.query("ALTER TABLE `user_posts` DROP FOREIGN KEY `FK_9152833f45dc4ce32a5b0b016c2`");
        await queryRunner.query("ALTER TABLE `user` DROP FOREIGN KEY `FK_4d79edb29ed31870be0b1c32d5a`");
        await queryRunner.query("DROP TABLE `posts`");
        await queryRunner.query("DROP INDEX `REL_9152833f45dc4ce32a5b0b016c` ON `user_posts`");
        await queryRunner.query("DROP TABLE `user_posts`");
        await queryRunner.query("DROP INDEX `REL_4d79edb29ed31870be0b1c32d5` ON `user`");
        await queryRunner.query("DROP INDEX `IDX_638bac731294171648258260ff` ON `user`");
        await queryRunner.query("DROP TABLE `user`");
    }

}
