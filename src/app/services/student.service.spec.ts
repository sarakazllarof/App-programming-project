import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Student {
  id?: number;
  firstName: string;
  lastName: string;
  serialNumber: string;
  course?: Course;
}

export interface Course {
  id?: number;
  code: string;
  title: string;
  description: string;
  year: number;
  teacher?: Teacher;
}

export interface Teacher {
  id?: number;
  firstName: string;
  lastName: string;
  title: string;
}

export interface StudentRequest {
  firstName: string;
  lastName: string;
  serialNumber: string;
}

export interface BackendResponse<T> {
  payload: {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
  };
  errors: any[];
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  // Basic CRUD Operations
  getAll(page: number = 0, size: number = 10, search: string = ''): Observable<PaginatedResponse<Student>> {
    const body = {
      text: search || "",
      page: page,
      size: size
    };

    return this.http.post<BackendResponse<Student>>(`${this.baseUrl}/filterStudents`, body)
      .pipe(
        map(response => response.payload || { content: [], totalElements: 0, totalPages: 0, size: size, number: page })
      );
  }

  getById(id: number): Observable<Student> {
    const body = { id: id };
    return this.http.post<any>(`${this.baseUrl}/getStudent`, body)
      .pipe(
        map(response => response.payload || response)
      );
  }

  create(student: StudentRequest): Observable<Student> {
    return this.http.post<any>(`${this.baseUrl}/upsertStudent`, student)
      .pipe(
        map(response => response.payload || response)
      );
  }

  update(id: number, student: StudentRequest): Observable<Student> {
    const body = { ...student, id: id };
    return this.http.post<any>(`${this.baseUrl}/upsertStudent`, body)
      .pipe(
        map(response => response.payload || response)
      );
  }

  delete(id: number): Observable<void> {
    const body = { id: id };
    return this.http.post<any>(`${this.baseUrl}/deleteStudent`, body)
      .pipe(
        map(() => void 0)
      );
  }

  // Optional: Association methods (if backend supports)
  associateStudentToCourse?(studentId: number, courseId: number): Observable<void> {
    const body = { idStudent: studentId, idCourse: courseId };
    return this.http.post<any>(`${this.baseUrl}/associateStudentToCourse`, body)
      .pipe(
        map(() => void 0)
      );
  }

  removeStudentFromCourse?(studentId: number, courseId: number): Observable<void> {
    const body = { idStudent: studentId, idCourse: courseId };
    return this.http.post<any>(`${this.baseUrl}/removeStudentFromCourse`, body)
      .pipe(
        map(() => void 0)
      );
  }
}