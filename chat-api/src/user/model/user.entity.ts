import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column({ select: false })
  password: string;

  @Column({ unique: true })
  email: string;

  @BeforeInsert()
  emailToLower() {
    this.email = this.email.toLocaleLowerCase();
  }
}
