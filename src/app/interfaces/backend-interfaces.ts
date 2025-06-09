
export interface RespSingleDto<T> {
  data: T;
  errors: string[];
}

export interface RespSliceDto<T> {
  data: {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
  };
  errors: string[];
}

export interface SimpleStringFilterDto {
  filter: string;
  pagination: {
    pageNumber: number;
    pageSize: number;
  };
}

export interface LongIdDto {
  id: number;
}

export interface CourseTeacherAssocDto {
  idTeacher: number;
  idCourse: number;
}

export interface CourseStudentAssocDto {
  idStudent: number;
  idCourse: number;
}

// Domain interfaces
export interface Course {
  id?: number;
  code: string;
  title: string;
  description: string;
  year: number;
  teacher?: Teacher;
  students?: Student[];
}

export interface Teacher {
  id?: number;
  firstName: string;
  lastName: string;
  title: string;
  courses?: Course[];
}

export interface Student {
  id?: number;
  firstName: string;
  lastName: string;
  serialNumber: string;
  course?: Course;
}

// Request interfaces
export interface CourseRequest {
  code: string;
  title: string;
  description: string;
  year: number;
}

export interface TeacherRequest {
  firstName: string;
  lastName: string;
  title: string;
}

export interface StudentRequest {
  firstName: string;
  lastName: string;
  serialNumber: string;
}

// Frontend pagination interface
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}