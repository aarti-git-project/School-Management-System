import { Document } from 'mongoose';

export interface UserDocument extends Document {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: 'parent' | 'teacher' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  generateToken: () => string;
  verifyPassword: (password: string) => Promise<boolean>;
}

export interface ParentDocument extends Document {
  userId: UserDocument['_id'];
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: Date;
  approvedBy?: UserDocument['_id'];
}

export interface TeacherDocument extends Document {
  userId: UserDocument['_id'];
  subject?: string;
  grade?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: Date;
  approvedBy?: UserDocument['_id'];
}

export interface ChildDocument extends Document {
  fullName: string;
  age: number;
  grade: string;
  parentId: ParentDocument['_id'];
  teacherId: TeacherDocument['_id'];
  createdAt: Date;
  updatedAt: Date;
}