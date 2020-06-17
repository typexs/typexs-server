import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';


@Entity()
export class DistributedRandomData {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  short: string;

  @Column()
  long: string;

  @Column()
  numValue: number;

  @Column()
  floatValue: number;

  @Column()
  bool: boolean = true;

  @Column()
  boolNeg: boolean = false;

  @Column()
  date: Date;
}
