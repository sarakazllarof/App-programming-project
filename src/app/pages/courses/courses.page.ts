
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CourseService } from 'src/app/services/course.service';
import { TeacherService } from 'src/app/services/teacher.service';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

import {
  Course,
  Teacher,
  Student,
  CourseRequest,
  PaginatedResponse
} from 'src/app/interfaces/backend-interfaces';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.page.html',
  standalone: false,
  styleUrls: ['./courses.page.scss'],
})
export class CoursesPage implements OnInit {
  courses: Course[] = [];
  teachers: Teacher[] = [];
  
  currentPage: number = 0;
  pageSize: number = 10;
  totalPages: number = 0;
  totalElements: number = 0;
  
  searchTerm: string = '';
  
  showForm: boolean = false;
  showDetailsModal: boolean = false;
  showTeacherModal: boolean = false;
  
  editingCourse: Course | null = null;
  selectedCourse: Course | null = null;
  courseForTeacher: Course | null = null;
  
  courseCode: string = '';
  courseTitle: string = '';
  courseDescription: string = '';
  courseYear: number = new Date().getFullYear();
  selectedTeacherId: number | null = null;
  selectedTeacherForAssociation: number | null = null;
  
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private courseService: CourseService,
    private teacherService: TeacherService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadCourses();
    this.loadTeachers();
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  async loadCourses() {
    this.isLoading = true;
    try {
      const response = await this.courseService
        .getAll(this.currentPage, this.pageSize, this.searchTerm).toPromise();
      
      if (response) {
        if (this.currentPage === 0) {
          this.courses = response.content;
        } else {
          this.courses = [...this.courses, ...response.content];
        }
        
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
      }
    } catch (error: any) {
      console.error('Gabim gjatë ngarkimit të kurseve:', error);
      this.showToast(error.message || 'Gabim gjatë ngarkimit të kurseve', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  async loadTeachers() {
    try {
      const response = await this.teacherService.getAll(0, 100).toPromise();
      if (response) {
        this.teachers = response.content;
      }
    } catch (error: any) {
      console.error('Gabim gjatë ngarkimit të mësimdhënësve:', error);
      this.showToast(error.message || 'Gabim gjatë ngarkimit të mësimdhënësve', 'warning');
    }
  }

  onSearchChange(searchTerm: string) {
    this.searchTerm = searchTerm;
    this.currentPage = 0;
    this.courses = [];
    this.loadCourses();
  }

  loadMoreData(event: any) {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadCourses().then(() => {
        event.target.complete();
      });
    } else {
      event.target.complete();
    }
  }

  // Statistics
  getCoursesWithTeachers(): number {
    return this.courses.filter(course => course.teacher && course.teacher.id).length;
  }

  // View Course Details
  viewCourseDetails(course: Course) {
    this.selectedCourse = course;
    this.showDetailsModal = true;
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedCourse = null;
  }

  editSelectedCourse() {
    if (this.selectedCourse) {
      this.closeDetailsModal();
      this.openEditForm(this.selectedCourse);
    }
  }

  // Add/Edit Course Forms
  openAddForm() {
    this.showForm = true;
    this.editingCourse = null;
    this.courseCode = '';
    this.courseTitle = '';
    this.courseDescription = '';
    this.courseYear = new Date().getFullYear();
    this.selectedTeacherId = null;
  }

  openEditForm(course: Course) {
    this.showForm = true;
    this.editingCourse = course;
    this.courseCode = course.code;
    this.courseTitle = course.title;
    this.courseDescription = course.description;
    this.courseYear = course.year;
    this.selectedTeacherId = course.teacher?.id ?? null;
  }

  cancelForm() {
    this.showForm = false;
    this.editingCourse = null;
    this.courseCode = '';
    this.courseTitle = '';
    this.courseDescription = '';
    this.courseYear = new Date().getFullYear();
    this.selectedTeacherId = null;
  }

  async saveCourse() {
    if (!this.courseCode.trim() || !this.courseTitle.trim() || !this.courseDescription.trim()) {
      this.showToast('Të gjitha fushat janë të detyrueshme', 'warning');
      return;
    }

    if (this.courseYear < 1900 || this.courseYear > 2100) {
      this.showToast('Viti duhet të jetë i vlefshëm', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Duke ruajtur...'
    });
    await loading.present();

    try {
      const courseData: CourseRequest = {
        code: this.courseCode,
        title: this.courseTitle,
        description: this.courseDescription,
        year: this.courseYear
      };

      if (this.editingCourse && this.editingCourse.id) {
        await this.courseService.update(this.editingCourse.id, courseData).toPromise();
        this.showToast('Kursi u përditësua me sukses', 'success');
      } else {
        await this.courseService.create(courseData).toPromise();
        this.showToast('Kursi u shtua me sukses', 'success');
      }

      this.cancelForm();
      this.refreshCourses();
    } catch (error: any) {
      console.error('Gabim gjatë ruajtjes:', error);
      this.showToast(error.message || 'Gabim gjatë ruajtjes së kursit', 'danger');
    } finally {
      loading.dismiss();
    }
  }

  // Associate Teacher
  associateTeacher(course: Course) {
    this.courseForTeacher = course;
    this.selectedTeacherForAssociation = null;
    this.showTeacherModal = true;
  }

  associateTeacherToSelected() {
    if (this.selectedCourse) {
      this.closeDetailsModal();
      this.associateTeacher(this.selectedCourse);
    }
  }

  closeTeacherModal() {
    this.showTeacherModal = false;
    this.courseForTeacher = null;
    this.selectedTeacherForAssociation = null;
  }

  async confirmTeacherAssociation() {
    if (!this.courseForTeacher || !this.selectedTeacherForAssociation) {
      this.showToast('Zgjidhni një mësimdhënës', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Duke asociuar mësimdhënës...'
    });
    await loading.present();

    try {
      await this.courseService.associateTeacherToCourse(
        this.selectedTeacherForAssociation,
        this.courseForTeacher.id!
      ).toPromise();
      
      this.showToast('Mësimdhënësi u asociua me sukses', 'success');
      this.closeTeacherModal();
      this.refreshCourses();
    } catch (error: any) {
      console.error('Gabim gjatë asociimit:', error);
      this.showToast(error.message || 'Gabim gjatë asociimit të mësimdhënësit', 'danger');
    } finally {
      loading.dismiss();
    }
  }

  // Remove Teacher
  async removeTeacherFromCourse(course: Course) {
    const alert = await this.alertController.create({
      header: 'Konfirmo veprimin',
      message: `A jeni i sigurt që doni të hiqni mësimdhënësin nga kursi "${course.title}"?`,
      buttons: [
        {
          text: 'Anulo',
          role: 'cancel'
        },
        {
          text: 'Hiq',
          role: 'destructive',
          handler: async () => {
            await this.performRemoveTeacher(course);
          }
        }
      ]
    });

    await alert.present();
  }

  async removeTeacherFromSelectedCourse() {
    if (this.selectedCourse) {
      this.closeDetailsModal();
      await this.removeTeacherFromCourse(this.selectedCourse);
    }
  }

  private async performRemoveTeacher(course: Course) {
    if (!course.teacher?.id) {
      this.showToast('Nuk ka mësimdhënës për të hequr', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Duke hequr mësimdhënës...'
    });
    await loading.present();

    try {
      await this.courseService.removeTeacherFromCourse(
        course.teacher.id,
        course.id!
      ).toPromise();
      
      this.showToast('Mësimdhënësi u hoq me sukses', 'success');
      this.refreshCourses();
    } catch (error: any) {
      console.error('Gabim gjatë heqjes së mësimdhënësit:', error);
      this.showToast(error.message || 'Gabim gjatë heqjes së mësimdhënësit', 'danger');
    } finally {
      loading.dismiss();
    }
  }

  // Delete Course
  async deleteCourse(course: Course) {
    if (!course.id) {
      this.showToast('Gabim: ID e kursit nuk ekziston', 'danger');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Konfirmo fshirjen',
      message: `A jeni i sigurt që doni të fshini kursin "${course.title}"?`,
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
              await this.courseService.delete(course.id!).toPromise();
              this.showToast('Kursi u fshi me sukses', 'success');
              this.refreshCourses();
            } catch (error: any) {
              console.error('Gabim gjatë fshirjes:', error);
              this.showToast(error.message || 'Gabim gjatë fshirjes së kursit', 'danger');
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
  private refreshCourses() {
    this.currentPage = 0;
    this.courses = [];
    this.loadCourses();
  }

  trackByCourse(index: number, course: Course): number {
    return course.id ?? index;
  }

  getTeacherName(teacher?: Teacher): string {
    if (!teacher) return 'Pa mësimdhënës';
    return `${teacher.firstName} ${teacher.lastName}`;
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