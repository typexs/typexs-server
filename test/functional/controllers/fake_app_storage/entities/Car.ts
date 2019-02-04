import {Column, Entity, PrimaryGeneratedColumn,OneToMany} from "typeorm";

import {Driver} from "./Driver";

@Entity()
export class Car {

  @PrimaryGeneratedColumn()
  id:number;

  @Column()
  name: string;

  @OneToMany(type => Driver, car => car.car)
  driver: Driver[];
}
