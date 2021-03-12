/* eslint-disable space-before-function-paren */
import { MigrationInterface, QueryRunner } from 'typeorm'

export class Login1615374506569 implements MigrationInterface {
  name = 'Login1615374506569'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `posts` DROP FOREIGN KEY `FK_cdc670193be6ca43f590dbabcee`')
    await queryRunner.query('ALTER TABLE `user` DROP FOREIGN KEY `FK_4d79edb29ed31870be0b1c32d5a`')
    await queryRunner.query('DROP INDEX `REL_4d79edb29ed31870be0b1c32d5` ON `user`')
    await queryRunner.query(
      'CREATE TABLE `post` (`id` int NOT NULL AUTO_INCREMENT, `title` char(100) NOT NULL, `imageUrl` char(100) NULL, `category` int NOT NULL, `userId` int NULL, UNIQUE INDEX `REL_5c1cf55c308037b5aca1038a13` (`userId`), PRIMARY KEY (`id`)) ENGINE=InnoDB'
    )
    await queryRunner.query(
      'CREATE TABLE `favorites` (`id` int NOT NULL AUTO_INCREMENT, `userId` int NOT NULL, `postId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB'
    )
    await queryRunner.query('ALTER TABLE `user` DROP COLUMN `userpostsId`')
    await queryRunner.query('ALTER TABLE `user` ADD `name` char(30) NULL')
    await queryRunner.query('ALTER TABLE `user` CHANGE `postId` `postId` int NULL')
    await queryRunner.query(
      'ALTER TABLE `user` ADD UNIQUE INDEX `IDX_3394a5669cfb3c85cea4b368fc` (`postId`)'
    )
    await queryRunner.query('ALTER TABLE `user` DROP COLUMN `googleId`')
    await queryRunner.query('ALTER TABLE `user` ADD `googleId` char(200) NULL')
    await queryRunner.query(
      'CREATE UNIQUE INDEX `REL_3394a5669cfb3c85cea4b368fc` ON `user` (`postId`)'
    )
    await queryRunner.query(
      'ALTER TABLE `posts` ADD CONSTRAINT `FK_cdc670193be6ca43f590dbabcee` FOREIGN KEY (`postId`) REFERENCES `post`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `post` ADD CONSTRAINT `FK_5c1cf55c308037b5aca1038a131` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `user` ADD CONSTRAINT `FK_3394a5669cfb3c85cea4b368fca` FOREIGN KEY (`postId`) REFERENCES `post`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `favorites` ADD CONSTRAINT `FK_e747534006c6e3c2f09939da60f` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `favorites` ADD CONSTRAINT `FK_b097e6b56a0634e988638f85a62` FOREIGN KEY (`postId`) REFERENCES `post`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `favorites` DROP FOREIGN KEY `FK_b097e6b56a0634e988638f85a62`'
    )
    await queryRunner.query(
      'ALTER TABLE `favorites` DROP FOREIGN KEY `FK_e747534006c6e3c2f09939da60f`'
    )
    await queryRunner.query('ALTER TABLE `user` DROP FOREIGN KEY `FK_3394a5669cfb3c85cea4b368fca`')
    await queryRunner.query('ALTER TABLE `post` DROP FOREIGN KEY `FK_5c1cf55c308037b5aca1038a131`')
    await queryRunner.query('ALTER TABLE `posts` DROP FOREIGN KEY `FK_cdc670193be6ca43f590dbabcee`')
    await queryRunner.query('DROP INDEX `REL_3394a5669cfb3c85cea4b368fc` ON `user`')
    await queryRunner.query('ALTER TABLE `user` DROP COLUMN `googleId`')
    await queryRunner.query('ALTER TABLE `user` ADD `googleId` char(50) NULL')
    await queryRunner.query('ALTER TABLE `user` DROP INDEX `IDX_3394a5669cfb3c85cea4b368fc`')
    await queryRunner.query('ALTER TABLE `user` CHANGE `postId` `postId` int NULL')
    await queryRunner.query('ALTER TABLE `user` DROP COLUMN `name`')
    await queryRunner.query('ALTER TABLE `user` ADD `userpostsId` int NULL')
    await queryRunner.query('DROP TABLE `favorites`')
    await queryRunner.query('DROP INDEX `REL_5c1cf55c308037b5aca1038a13` ON `post`')
    await queryRunner.query('DROP TABLE `post`')
    await queryRunner.query(
      'CREATE UNIQUE INDEX `REL_4d79edb29ed31870be0b1c32d5` ON `user` (`userpostsId`)'
    )
    await queryRunner.query(
      'ALTER TABLE `user` ADD CONSTRAINT `FK_4d79edb29ed31870be0b1c32d5a` FOREIGN KEY (`userpostsId`) REFERENCES `user_posts`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `posts` ADD CONSTRAINT `FK_cdc670193be6ca43f590dbabcee` FOREIGN KEY (`postId`) REFERENCES `user_posts`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    )
  }
}
