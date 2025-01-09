import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
export enum UserRole {
  ADMIN = 'ADMIN',
  INTERN = 'INTERN',
  ENGINEER = 'ENGINEER',
}
@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  user_id: number;
  @Column({ type: 'varchar', length: 45 })
  name: string;
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;
  @Column({ type: 'varchar', length: 11, unique: true })
  phoneNumber: string;
  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;
  @Column({ type: 'int', nullable: true })
  verificationCode: number;
  @Column()
  verificationDate: Date;
  @Column({ type: 'varchar', length: 255 })
  password: string;
  @Column({ type: 'varchar', length: 255, nullable: true })
  refreshToken: string;
}
