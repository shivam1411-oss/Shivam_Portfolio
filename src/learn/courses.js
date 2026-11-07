// The complete courses with all lesson content, for build scripts and tests (Node).
// The app itself uses catalog.js and loads each course with loadCourse(), so it never imports this file.
import site from './content/site';
import python from './content/python';
import pandas from './content/pandas';
import sql from './content/sql';
import viz from './content/viz';
import react from './content/react';
import jira from './content/jira';
import k8s from './content/k8s';

// To add a course: write its modules and lessons, a beginner guide in guides/, a content/<id>.js that
// combines them, a knowledge base in kb/, then list it here, in catalog.js (COURSE_IDS and the loaders)
// and in kb/data.js.
export const courses = [site, python, pandas, sql, viz, react, jira, k8s];
export const courseById = Object.fromEntries(courses.map((c) => [c.id, c]));
export { learningPath, learningPaths, techPath } from './paths';
export const lessonKey = (course, lesson) => `${course.id}/${lesson.id}`;
export const lessonHash = (course, lesson) => `#/c/${course.id}/${lesson.id}`;
