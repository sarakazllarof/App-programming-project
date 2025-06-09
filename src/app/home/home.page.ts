import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CourseService } from '../services/course.service';
import { TeacherService } from '../services/teacher.service';
import { StudentService } from '../services/student.service';

interface DashboardCard {
  title: string;
  count: number;
  icon: string;
  color: string;
  route: string;
  description: string;
}

@Component({
  selector: 'app-home',
  standalone: false,  
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  
  dashboardCards: DashboardCard[] = [
    {
      title: 'Kurset',
      count: 0,
      icon: 'school-outline',
      color: 'primary',
      route: '/courses',
      description: 'Menaxho kurset e shkolles'
    },
    {
      title: 'Studentet',
      count: 0,
      icon: 'people-outline',
      color: 'secondary', 
      route: '/students',
      description: 'Menaxho studentet'
    },
    {
      title: 'Mesimdhenes',
      count: 0,
      icon: 'person-outline',
      color: 'tertiary',
      route: '/teachers',
      description: 'Menaxho mesimdhenes'
    }
  ];

  isLoading = true;
  currentTime = new Date();

  constructor(
    private router: Router,
    private courseService: CourseService,
    private teacherService: TeacherService,
    private studentService: StudentService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
    this.updateTime();
    
    setInterval(() => {
      this.updateTime();
    }, 60000);
  }

  async loadDashboardData() {
    this.isLoading = true;
    
    try {
      const coursesResponse = await this.courseService.getAll(0, 1).toPromise();
      if (coursesResponse) {
        this.dashboardCards[0].count = coursesResponse.totalElements;
      }

      const teachersResponse = await this.teacherService.getAll(0, 1).toPromise();
      if (teachersResponse) {
        this.dashboardCards[2].count = teachersResponse.totalElements;
      }

      const studentsResponse = await this.studentService.getAll(0, 1).toPromise();
      if (studentsResponse) {
        this.dashboardCards[1].count = studentsResponse.totalElements;
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  navigateToPage(route: string) {
    this.router.navigate([route]);
  }

  updateTime() {
    this.currentTime = new Date();
  }

  getGreeting(): string {
    const hour = this.currentTime.getHours();
    
    if (hour < 12) {
      return 'Miremengjes';
    } else if (hour < 17) {
      return 'Miredita';
    } else {
      return 'Mirembrema';
    }
  }

  getFormattedDate(): string {
    return this.currentTime.toLocaleDateString('sq-AL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getFormattedTime(): string {
    return this.currentTime.toLocaleTimeString('sq-AL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  async refreshData(event: any) {
    await this.loadDashboardData();
    event.target.complete();
  }

  trackByCard(index: number, card: DashboardCard): string {
    return card.route;
  }
}