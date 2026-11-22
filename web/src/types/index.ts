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

export type Course = {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  duration: number;
  level: string;
  category: string | null;
  instructor: string | null;
  is_enrolled: boolean;
};

export type Category = { id: number; name: string };

export type Progress = {
  total_lessons: number;
  completed_lessons: number;
  percentage: number;
  completed_lesson_ids: number[];
};

export type Curriculum = {
  course: { id: number; title: string; slug: string };
  modules: {
    id: number;
    title: string;
    lessons: { id: number; title: string; duration: number }[];
  }[];
  progress: Progress;
  last_lesson_id: number | null;
};

export type LessonDetail = {
  id: number;
  title: string;
  description: string | null;
  content: string | null;
  video_url: string | null;
  duration: number;
  module: string;
  course: { id: number; title: string; slug: string };
  is_completed: boolean;
  prev_lesson_id: number | null;
  next_lesson_id: number | null;
};

export type Assignment = {
  id: number;
  title: string;
  course: string;
  deadline: string | null;
  status: "pending" | "submitted";
  description?: string;
  submission_text?: string | null;
  submitted_at?: string | null;
};
