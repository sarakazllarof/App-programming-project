
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

import {
  Student,
  Course,
  StudentRequest,
  CourseStudentAssocDto,
  RespSingleDto,
  RespSliceDto,
  SimpleStringFilterDto,
  LongIdDto,
  PaginatedResponse
} from '../interfaces/backend-interfaces';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  getAll(page: number = 0, size: number = 10, search: string = ''): Observable<PaginatedResponse<Student>> {
    const body: SimpleStringFilterDto = {
      filter: search,
      pagination: {
        pageNumber: page,
        pageSize: size
      }
    };

    return this.http.post<RespSliceDto<Student>>(`${this.baseUrl}/filterStudents`, body)
      .pipe(
        map(response => {
          if (response.errors && response.errors.length > 0) {
            throw new Error(response.errors.join(', '));
          }
          return response.data;
        }),
        catchError(error => {
          console.error('Error in getAll students:', error);
          return throwError(() => new Error(error.message || 'Error loading students'));
        })
      );
  }

  getById(id: number): Observable<Student> {
    const body: LongIdDto = { id: id };
    return this.http.post<RespSingleDto<Student>>(`${this.baseUrl}/getStudent`, body)
      .pipe(
        map(response => {
          if (response.errors && response.errors.length > 0) {
            throw new Error(response.errors.join(', '));
          }
          return response.data;
        }),
        catchError(error => {
          console.error('Error in getById student:', error);
          return throwError(() => new Error(error.message || 'Error loading student'));
        })
      );
  }

  create(student: StudentRequest): Observable<Student> {
    return this.http.post<RespSingleDto<Student>>(`${this.baseUrl}/upsertStudent`, student)
      .pipe(
        map(response => {
          if (response.errors && response.errors.length > 0) {
            throw new Error(response.errors.join(', '));
          }
          return response.data;
        }),
        catchError(error => {
          console.error('Error in create student:', error);
          return throwError(() => new Error(error.message || 'Error creating student'));
        })
      );
  }

  update(id: number, student: StudentRequest): Observable<Student> {
    const body = { ...student, id: id };
    return this.http.post<RespSingleDto<Student>>(`${this.baseUrl}/upsertStudent`, body)
      .pipe(
        map(response => {
          if (response.errors && response.errors.length > 0) {
            throw new Error(response.errors.join(', '));
          }
          return response.data;
        }),
        catchError(error => {
          console.error('Error in update student:', error);
          return throwError(() => new Error(error.message || 'Error updating student'));
        })
      );
  }

  delete(id: number): Observable<void> {
    const body: LongIdDto = { id: id };
    return this.http.post<RespSingleDto<void>>(`${this.baseUrl}/deleteStudent`, body)
      .pipe(
        map(response => {
          if (response.errors && response.errors.length > 0) {
            throw new Error(response.errors.join(', '));
          }
          return void 0;
        }),
        catchError(error => {
          console.error('Error in delete student:', error);
          return throwError(() => new Error(error.message || 'Error deleting student'));
        })
      );
  }

  associateStudentToCourse(studentId: number, courseId: number): Observable<void> {
    const body: CourseStudentAssocDto = {
      idStudent: studentId,
      idCourse: courseId
    };
    return this.http.post<RespSingleDto<void>>(`${this.baseUrl}/associateStudentToCourse`, body)
      .pipe(
        map(response => {
          if (response.errors && response.errors.length > 0) {
            throw new Error(response.errors.join(', '));
          }
          return void 0;
        }),
        catchError(error => {
          console.error('Error in associateStudentToCourse:', error);
          return throwError(() => new Error(error.message || 'Error associating student to course'));
        })
      );
  }

  removeStudentFromCourse(studentId: number, courseId: number): Observable<void> {
    const body: CourseStudentAssocDto = {
      idStudent: studentId,
      idCourse: courseId
    };
    return this.http.post<RespSingleDto<void>>(`${this.baseUrl}/removeStudentFromCourse`, body)
      .pipe(
        map(response => {
          if (response.errors && response.errors.length > 0) {
            throw new Error(response.errors.join(', '));
          }
          return void 0;
        }),
        catchError(error => {
          console.error('Error in removeStudentFromCourse:', error);
          return throwError(() => new Error(error.message || 'Error removing student from course'));
        })
      );
  }
}