// Attach each lesson's beginner guide (idea, terms, mistakes, faq, recap) to the lesson.
export const withGuide = (course, guide) => ({ ...course, lessons: course.lessons.map((l) => ({ ...l, guide: guide[l.id] })) });
