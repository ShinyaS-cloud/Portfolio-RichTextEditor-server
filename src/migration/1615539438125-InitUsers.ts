/* eslint-disable space-before-function-paren */
import { MigrationInterface, QueryRunner } from 'typeorm'

export class InitUsers1615539438125 implements MigrationInterface {
  name = 'InitUsers1615539438125'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `favorites` (`id` int NOT NULL AUTO_INCREMENT, `userId` int NOT NULL, `articleId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB'
    )
    await queryRunner.query(
      'CREATE TABLE `users` (`id` int NOT NULL AUTO_INCREMENT, `name` char(30) NULL, `password` char(200) NULL, `email` char(50) NULL, `postsId` int NULL, `googleId` char(200) NULL, `loginGoogle` tinyint NOT NULL, UNIQUE INDEX `REL_7f367199511081e1468b5b7393` (`postsId`), PRIMARY KEY (`id`)) ENGINE=InnoDB'
    )
    await queryRunner.query(
      'CREATE TABLE `posts` (`id` int NOT NULL AUTO_INCREMENT, `userId` int NULL, UNIQUE INDEX `REL_ae05faaa55c866130abef6e1fe` (`userId`), PRIMARY KEY (`id`)) ENGINE=InnoDB'
    )
    await queryRunner.query(
      'CREATE TABLE `article` (`id` int NOT NULL AUTO_INCREMENT, `title` char(100) NULL, `imageUrl` char(100) NULL, `category` int NULL, `content` json NULL, `postsId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB'
    )
    await queryRunner.query(
      'ALTER TABLE `favorites` ADD CONSTRAINT `FK_e747534006c6e3c2f09939da60f` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `favorites` ADD CONSTRAINT `FK_a9e25be94f65c6f11f420d97bca` FOREIGN KEY (`articleId`) REFERENCES `article`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `users` ADD CONSTRAINT `FK_7f367199511081e1468b5b7393b` FOREIGN KEY (`postsId`) REFERENCES `posts`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `posts` ADD CONSTRAINT `FK_ae05faaa55c866130abef6e1fee` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `article` ADD CONSTRAINT `FK_a5c59ea92a12d7968068a440aa7` FOREIGN KEY (`postsId`) REFERENCES `posts`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `article` DROP FOREIGN KEY `FK_a5c59ea92a12d7968068a440aa7`'
    )
    await queryRunner.query('ALTER TABLE `posts` DROP FOREIGN KEY `FK_ae05faaa55c866130abef6e1fee`')
    await queryRunner.query('ALTER TABLE `users` DROP FOREIGN KEY `FK_7f367199511081e1468b5b7393b`')
    await queryRunner.query(
      'ALTER TABLE `favorites` DROP FOREIGN KEY `FK_a9e25be94f65c6f11f420d97bca`'
    )
    await queryRunner.query(
      'ALTER TABLE `favorites` DROP FOREIGN KEY `FK_e747534006c6e3c2f09939da60f`'
    )
    await queryRunner.query('DROP TABLE `article`')
    await queryRunner.query('DROP INDEX `REL_ae05faaa55c866130abef6e1fe` ON `posts`')
    await queryRunner.query('DROP TABLE `posts`')
    await queryRunner.query('DROP INDEX `REL_7f367199511081e1468b5b7393` ON `users`')
    await queryRunner.query('DROP TABLE `users`')
    await queryRunner.query('DROP TABLE `favorites`')
  }
}