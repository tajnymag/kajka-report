import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Log {

	@PrimaryGeneratedColumn()
	id!: number;

	@Column()
	addedCount!: number;

	@Column()
	date!: Date;
}
