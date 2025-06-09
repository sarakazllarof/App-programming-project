
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

import {
  Course,
  Teacher,
  Student,
  CourseRequest,
  CourseTeacherAssocDto,
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
export class CourseService {
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  getAll(page: number = 0, size: number = 10, search: string = ''): Observable<PaginatedResponse<Course>> {
    const body: SimpleStringFilterDto = {
      filter: search,
      pagination: {
        pageNumber: page,
        pageSize: size
      }
    };

    return this.http.post<RespSliceDto<Course>>(`${this.baseUrl}/filterCourses`, body)
      .pipe(
        map(response => {
          if (response.errors && response.errors.length > 0) {
            throw new Error(response.errors.join(', '));
          }
          return response.data;
        }),
        catchError(error => {
          console.error('Error in getAll courses:', error);
          return throwError(() => new Error(error.message || 'Error loading courses'));
        })
      );
  }

  getById(id: number): Observable<Course> {
    const body: LongIdDto = { id: id };
    return this.http.post<RespSingleDto<Course>>(`${this.baseUrl}/getCourse`, body)
      .pipe(
        map(response => {
          if (response.errors && response.errors.length > 0) {
            throw new Error(response.errors.join(', '));
          }
          return response.data;
        }),
        catchError(error => {
          console.error('Error in getById course:', error);
          return throwError(() => new Error(error.message || 'Error loading course'));
        })
      );
  }

  create(course: CourseRequest): Observable<Course> {
    return this.http.post<RespSingleDto<Course>>(`${this.baseUrl}/upsertCourse`, course)
      .pipe(
        map(response => {
          if (response.errors && response.errors.length > 0) {
            throw new Error(response.errors.join(', '));
          }
          return response.data;
        }),
        catchError(error => {
          console.error('Error in create course:', error);
          return throwError(() => new Error(error.message || 'Error creating course'));
        })
      );
  }

  update(id: number, course: CourseRequest): Observable<Course> {
    const body = { ...course, id: id };
    return this.http.post<RespSingleDto<Course>>(`${this.baseUrl}/upsertCourse`, body)
      .pipe(
        map(response => {
          if (response.errors && response.errors.length > 0) {
            throw new Error(response.errors.join(', '));
          }
          return response.data;
        }),
        catchError(error => {
          console.error('Error in update course:', error);
          return throwError(() => new Error(error.message || 'Error updating course'));
        })
      );
  }

  delete(id: number): Observable<void> {
    const body: LongIdDto = { id: id };
    return this.http.post<RespSingleDto<void>>(`${this.baseUrl}/deleteCourse`, body)
      .pipe(
        map(response => {
          if (response.errors && response.errors.length > 0) {
            throw new Error(response.errors.join(', '));
          }
          return void 0;
        }),
        catchError(error => {
          console.error('Error in delete course:', error);
          return throwError(() => new Error(error.message || 'Error deleting course'));
        })
      );
  }

  associateTeacherToCourse(teacherId: number, courseId: number): Observable<void> {
    const body: CourseTeacherAssocDto = {
      idTeacher: teacherId,
      idCourse: courseId
    };
    return this.http.post<RespSingleDto<void>>(`${this.baseUrl}/associateTeacherToCourse`, body)
      .pipe(
        map(response => {
          if (response.errors && response.errors.length > 0) {
            throw new Error(response.errors.join(', '));
          }
          return void 0;
        }),
        catchError(error => {
          console.error('Error in associateTeacherToCourse:', error);
          return throwError(() => new Error(error.message || 'Error associating teacher to course'));
        })
      );
  }

  removeTeacherFromCourse(teacherId: number, courseId: number): Observable<void> {
    const body: CourseTeacherAssocDto = {
      idTeacher: teacherId,
      idCourse: courseId
    };
    return this.http.post<RespSingleDto<void>>(`${this.baseUrl}/removeTeacherFromCourse`, body)
      .pipe(
        map(response => {
          if (response.errors && response.errors.length > 0) {
            throw new Error(response.errors.join(', '));
          }
          return void 0;
        }),
        catchError(error => {
          console.error('Error in removeTeacherFromCourse:', error);
          return throwError(() => new Error(error.message || 'Error removing teacher from course'));
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