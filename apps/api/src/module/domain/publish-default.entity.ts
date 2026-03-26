import { Column } from 'typeorm';
import { PublishAccessLevel, AgeRating } from './enums';

export class PublishDefaultEntity {
  @Column({
    type: 'varchar',
    default: PublishAccessLevel.PUBLIC,
    comment: '기본 접근 레벨',
  })
  defaultAccessLevel: PublishAccessLevel;

  @Column({
    type: 'int',
    default: 0,
    comment: '기본 가격',
  })
  defaultPrice: number;

  @Column({
    type: 'varchar',
    default: AgeRating.ALL,
    comment: '기본 연령 등급',
  })
  defaultAgeRating: AgeRating;

  static createDefault(): PublishDefaultEntity {
    const entity = new PublishDefaultEntity();
    entity.defaultAccessLevel = PublishAccessLevel.PUBLIC;
    entity.defaultPrice = 0;
    entity.defaultAgeRating = AgeRating.ALL;
    return entity;
  }
}
