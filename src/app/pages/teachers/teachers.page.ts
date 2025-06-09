import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TeacherService } from 'src/app/services/teacher.service';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

export interface Teacher {
  id?: number;
  firstName: string;
  lastName: string;
  title: string;
  courses?: Course[];
}

export interface Course {
  id?: number;
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

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Component({
  selector: 'app-teachers',
  standalone: false,
  templateUrl: './teachers.page.html',
  styleUrls: ['./teachers.page.scss'],
})
export class TeachersPage implements OnInit {
  teachers: Teacher[] = [];
  
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
  
  // Form Data
  editingTeacher: Teacher | null = null;
  selectedTeacher: Teacher | null = null;
  teacherFirstName: string = '';
  teacherLastName: string = '';
  teacherTitle: string = '';
  
  // Loading
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private teacherService: TeacherService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadTeachers();
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  async loadTeachers() {
    this.isLoading = true;
    try {
      const response = await this.teacherService
        .getAll(this.currentPage, this.pageSize, this.searchTerm).toPromise();
      
      if (response) {
        if (this.currentPage === 0) {
          this.teachers = response.content;
        } else {
          this.teachers = [...this.teachers, ...response.content];
        }
        
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
      }
    } catch (error) {
      console.error('Gabim gjatë ngarkimit të mësimdhënësve:', error);
      this.showToast('Gabim gjatë ngarkimit të mësimdhënësve', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  onSearchChange(searchTerm: string) {
    this.searchTerm = searchTerm;
    this.currentPage = 0;
    this.teachers = [];
    this.loadTeachers();
  }

  loadMoreData(event: any) {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadTeachers().then(() => {
        event.target.complete();
      });
    } else {
      event.target.complete();
    }
  }

  // View Teacher Details
  viewTeacherDetails(teacher: Teacher) {
    this.selectedTeacher = teacher;
    this.showDetailsModal = true;
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedTeacher = null;
  }

  editSelectedTeacher() {
    if (this.selectedTeacher) {
      this.closeDetailsModal();
      this.openEditForm(this.selectedTeacher);
    }
  }

  // Add/Edit Teacher Forms
  openAddForm() {
    this.showForm = true;
    this.editingTeacher = null;
    this.teacherFirstName = '';
    this.teacherLastName = '';
    this.teacherTitle = '';
  }

  openEditForm(teacher: Teacher) {
    this.showForm = true;
    this.editingTeacher = teacher;
    this.teacherFirstName = teacher.firstName;
    this.teacherLastName = teacher.lastName;
    this.teacherTitle = teacher.title;
  }

  cancelForm() {
    this.showForm = false;
    this.editingTeacher = null;
    this.teacherFirstName = '';
    this.teacherLastName = '';
    this.teacherTitle = '';
  }

  async saveTeacher() {
    if (!this.teacherFirstName.trim() || !this.teacherLastName.trim() || !this.teacherTitle.trim()) {
      this.showToast('Të gjitha fushat janë të detyrueshme', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Duke ruajtur...'
    });
    await loading.present();

    try {
      const teacherData: TeacherRequest = {
        firstName: this.teacherFirstName,
        lastName: this.teacherLastName,
        title: this.teacherTitle
      };

      if (this.editingTeacher && this.editingTeacher.id) {
        await this.teacherService.update(this.editingTeacher.id, teacherData).toPromise();
        this.showToast('Mësimdhënësi u përditësua me sukses', 'success');
      } else {
        await this.teacherService.create(teacherData).toPromise();
        this.showToast('Mësimdhënësi u shtua me sukses', 'success');
      }

      this.cancelForm();
      this.refreshTeachers();
    } catch (error: any) {
      console.error('Gabim gjatë ruajtjes:', error);
      const message = error.error?.message || 'Gabim gjatë ruajtjes së mësimdhënësit';
      this.showToast(message, 'danger');
    } finally {
      loading.dismiss();
    }
  }

  // Delete Teacher
  async deleteTeacher(teacher: Teacher) {
    if (!teacher.id) {
      this.showToast('Gabim: ID e mësimdhënësit nuk ekziston', 'danger');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Konfirmo fshirjen',
      message: `A jeni i sigurt që doni të fshini mësimdhënësin "${teacher.firstName} ${teacher.lastName}"?`,
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
              await this.teacherService.delete(teacher.id!).toPromise();
              this.showToast('Mësimdhënësi u fshi me sukses', 'success');
              this.refreshTeachers();
            } catch (error: any) {
              console.error('Gabim gjatë fshirjes:', error);
              const message = error.error?.message || 'Gabim gjatë fshirjes së mësimdhënësit';
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
  private refreshTeachers() {
    this.currentPage = 0;
    this.teachers = [];
    this.loadTeachers();
  }

  trackByTeacher(index: number, teacher: Teacher): number {
    return teacher.id ?? index;
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