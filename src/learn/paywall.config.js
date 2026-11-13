// What is free and what is paid in the Learning Lab. Read by the build (scripts and the Vite plugin)
// and by the app. Prices themselves live in Supabase (public.products), so they can change without a
// rebuild; the numbers here are only shown if the price list cannot be fetched.

/** Courses that are free from start to finish. */
export const FREE_COURSES = ['site'];

/** Extra lessons to give away beyond each course's first module, by course id, e.g. { pandas: ['np-arrays'] }. */
export const EXTRA_FREE_LESSONS = {};

/** Every paid course's first module is free; free courses are free throughout. */
export const isLessonFree = (course, lesson) =>
  FREE_COURSES.includes(course.id) || lesson.module === course.modules[0].id || (EXTRA_FREE_LESSONS[course.id] || []).includes(lesson.id);

export const isCoursePaid = (course) => !FREE_COURSES.includes(course.id);

/** Shown only when the live price list cannot be loaded (paise). */
export const FALLBACK_PRICES = { course: 39900, all: 149900 };
