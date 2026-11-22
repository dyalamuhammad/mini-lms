export type DashboardCourse = {
  course_id: number;
  title: string;
  slug: string;
  thumbnail: string | null;
  status: string;
  percentage: number;
  completed_lessons: number;
  total_lessons: number;
  last_lesson_id: number | null;
  last_lesson_title: string | null;
};

export type Dashboard = {
  user: { id: number; name: string };
  stats: {
    total_courses: number;
    in_progress: number;
    completed: number;
    overall_progress: number;
  };
  continue_learning: DashboardCourse | null;
  courses: DashboardCourse[];
  upcoming_assignments: {
    id: number;
    title: string;
    course: string;
    deadline: string;
  }[];
  recent_activity: { lesson: string; course: string; completed_at: string }[];
};
