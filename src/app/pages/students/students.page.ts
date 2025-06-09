import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StudentService } from 'src/app/services/student.service';
import { CourseService } from 'src/app/services/course.service';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

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

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Component({
  selector: 'app-students',
  templateUrl: './students.page.html',
  standalone: false,
  styleUrls: ['./students.page.scss'],
})
export class StudentsPage implements OnInit {
  students: Student[] = [];
  courses: Course[] = [];
  
  // Pagination
  currentPage: number = 0;
  pageSize: number = 10;
  totalPages: number = 0;
  totalElements: number = 0;
  
  // Search
  searchTerm: string = '';
  
  // Form Modals
  showForm: boolean = false;
  showDetailsModal: boolean = false;
  showCourseModal: boolean = false;
  
  // Form Data
  editingStudent: Student | null = null;
  selectedStudent: Student | null = null;
  studentForCourse: Student | null = null;
  studentFirstName: string = '';
  studentLastName: string = '';
  studentSerialNumber: string = '';
  selectedCourseId: number | null = null;
  selectedCourseForAssociation: number | null = null;
  
  // Loading
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private studentService: StudentService,
    private courseService: CourseService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadStudents();
    this.loadCourses();
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  async loadStudents() {
    this.isLoading = true;
    try {
      const response = await this.studentService
        .getAll(this.currentPage, this.pageSize, this.searchTerm).toPromise();
      
      if (response) {
        if (this.currentPage === 0) {
          this.students = response.content;
        } else {
          this.students = [...this.students, ...response.content];
        }
        
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
      }
    } catch (error) {
      console.error('Gabim gjatë ngarkimit të studentëve:', error);
      this.showToast('Gabim gjatë ngarkimit të studentëve', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  async loadCourses() {
    try {
      const response = await this.courseService.getAll(0, 100).toPromise();
      if (response) {
        this.courses = response.content;
      }
    } catch (error) {
      console.error('Gabim gjatë ngarkimit të kurseve:', error);
    }
  }

  onSearchChange(searchTerm: string) {
    this.searchTerm = searchTerm;
    this.currentPage = 0;
    this.students = [];
    this.loadStudents();
  }

  loadMoreData(event: any) {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadStudents().then(() => {
        event.target.complete();
      });
    } else {
      event.target.complete();
    }
  }

  // Statistics
  getStudentsWithCourses(): number {
    return this.students.filter(student => student.course && student.course.id).length;
  }

  // View Student Details
  viewStudentDetails(student: Student) {
    this.selectedStudent = student;
    this.showDetailsModal = true;
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedStudent = null;
  }

  editSelectedStudent() {
    if (this.selectedStudent) {
      this.closeDetailsModal();
      this.openEditForm(this.selectedStudent);
    }
  }

  // Add/Edit Student Forms
  openAddForm() {
    this.showForm = true;
    this.editingStudent = null;
    this.studentFirstName = '';
    this.studentLastName = '';
    this.studentSerialNumber = '';
    this.selectedCourseId = null;
  }

  openEditForm(student: Student) {
    this.showForm = true;
    this.editingStudent = student;
    this.studentFirstName = student.firstName;
    this.studentLastName = student.lastName;
    this.studentSerialNumber = student.serialNumber;
    this.selectedCourseId = student.course?.id ?? null;
  }

  cancelForm() {
    this.showForm = false;
    this.editingStudent = null;
    this.studentFirstName = '';
    this.studentLastName = '';
    this.studentSerialNumber = '';
    this.selectedCourseId = null;
  }

  async saveStudent() {
    if (!this.studentFirstName.trim() || !this.studentLastName.trim() || !this.studentSerialNumber.trim()) {
      this.showToast('Emri, mbiemri dhe numri serial janë të detyrueshëm', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Duke ruajtur...'
    });
    await loading.present();

    try {
      const studentData: StudentRequest = {
        firstName: this.studentFirstName,
        lastName: this.studentLastName,
        serialNumber: this.studentSerialNumber
      };

      if (this.editingStudent && this.editingStudent.id) {
        await this.studentService.update(this.editingStudent.id, studentData).toPromise();
        this.showToast('Studenti u përditësua me sukses', 'success');
      } else {
        await this.studentService.create(studentData).toPromise();
        this.showToast('Studenti u shtua me sukses', 'success');
      }

      this.cancelForm();
      this.refreshStudents();
    } catch (error: any) {
      console.error('Gabim gjatë ruajtjes:', error);
      const message = error.error?.message || 'Gabim gjatë ruajtjes së studentit';
      this.showToast(message, 'danger');
    } finally {
      loading.dismiss();
    }
  }

  // Associate to Course
  associateToCourse(student: Student) {
    this.studentForCourse = student;
    this.selectedCourseForAssociation = null;
    this.showCourseModal = true;
  }

  associateStudentToSelectedCourse() {
    if (this.selectedStudent) {
      this.closeDetailsModal();
      this.associateToCourse(this.selectedStudent);
    }
  }

  closeCourseModal() {
    this.showCourseModal = false;
    this.studentForCourse = null;
    this.selectedCourseForAssociation = null;
  }

  async confirmCourseAssociation() {
    if (!this.studentForCourse || !this.selectedCourseForAssociation) {
      this.showToast('Zgjidhni një kurs', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Duke asociuar me kurs...'
    });
    await loading.present();

    try {
      //  Use association endpoint if available, otherwise use generic update
      if (this.studentService.associateStudentToCourse) {
        await this.studentService.associateStudentToCourse(
          this.studentForCourse.id!,
          this.selectedCourseForAssociation
        ).toPromise();
      } else {
        // Fallback to generic update
        const studentData: StudentRequest = {
          firstName: this.studentForCourse.firstName,
          lastName: this.studentForCourse.lastName,
          serialNumber: this.studentForCourse.serialNumber
        };
        await this.studentService.update(this.studentForCourse.id!, studentData).toPromise();
      }
      
      this.showToast('Studenti u asociua me kursin me sukses', 'success');
      this.closeCourseModal();
      this.refreshStudents();
    } catch (error: any) {
      console.error('Gabim gjatë asociimit:', error);
      const message = error.error?.message || 'Gabim gjatë asociimit me kurs';
      this.showToast(message, 'danger');
    } finally {
      loading.dismiss();
    }
  }

  // Remove Student from Course
  async removeStudentFromCourse(student: Student) {
    const alert = await this.alertController.create({
      header: 'Konfirmo veprimin',
      message: `A jeni i sigurt që doni të hiqni studentin "${student.firstName} ${student.lastName}" nga kursi?`,
      buttons: [
        {
          text: 'Anulo',
          role: 'cancel'
        },
        {
          text: 'Hiq',
          role: 'destructive',
          handler: async () => {
            await this.performRemoveFromCourse(student);
          }
        }
      ]
    });

    await alert.present();
  }

  async removeStudentFromSelectedCourse() {
    if (this.selectedStudent) {
      this.closeDetailsModal();
      await this.removeStudentFromCourse(this.selectedStudent);
    }
  }

  private async performRemoveFromCourse(student: Student) {
    if (!student.course?.id) {
      this.showToast('Studenti nuk është i regjistruar në ndonjë kurs', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Duke hequr nga kursi...'
    });
    await loading.present();

    try {
      //  Use remove endpoint if available
      if (this.studentService.removeStudentFromCourse) {
        await this.studentService.removeStudentFromCourse(
          student.id!,
          student.course.id
        ).toPromise();
      } else {
        // Fallback to generic update
        const studentData: StudentRequest = {
          firstName: student.firstName,
          lastName: student.lastName,
          serialNumber: student.serialNumber
        };
        await this.studentService.update(student.id!, studentData).toPromise();
      }
      
      this.showToast('Studenti u hoq nga kursi me sukses', 'success');
      this.refreshStudents();
    } catch (error: any) {
      console.error('Gabim gjatë heqjes nga kursi:', error);
      const message = error.error?.message || 'Gabim gjatë heqjes nga kursi';
      this.showToast(message, 'danger');
    } finally {
      loading.dismiss();
    }
  }

  // Delete Student
  async deleteStudent(student: Student) {
    if (!student.id) {
      this.showToast('Gabim: ID e studentit nuk ekziston', 'danger');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Konfirmo fshirjen',
      message: `A jeni i sigurt që doni të fshini studentin "${student.firstName} ${student.lastName}"?`,
      subHeader: 'Ky veprim nuk mund të kthehet prapa.',
      buttons: [
        {
          text: 'Anulo',
          role: 'cancel'
        },
        {
          text: 'Fshi',
          role: 'destructive',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Duke fshirë...'
            });
            await loading.present();

            try {
              await this.studentService.delete(student.id!).toPromise();
              this.showToast('Studenti u fshi me sukses', 'success');
              this.refreshStudents();
            } catch (error: any) {
              console.error('Gabim gjatë fshirjes:', error);
              const message = error.error?.message || 'Gabim gjatë fshirjes së studentit';
              this.showToast(message, 'danger');
            } finally {
              loading.dismiss();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  // Helper Methods
  private refreshStudents() {
    this.currentPage = 0;
    this.students = [];
    this.loadStudents();
  }

  trackByStudent(index: number, student: Student): number {
    return student.id ?? index;
  }

  getCourseName(course?: Course): string {
    if (!course) return 'Pa kurs';
    return course.title;
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom',
      cssClass: `toast-${color}`
    });
    toast.present();
  }
}