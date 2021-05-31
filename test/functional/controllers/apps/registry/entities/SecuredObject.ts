import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class SecuredObject {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
