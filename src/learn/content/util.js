// Attach each lesson's beginner guide (idea, terms, mistakes, faq, recap) to the lesson.
// `steps` (optional) adds a course's step-by-step material, kept in its own file when it brings a practice tool.
export const withGuide = (course, guide, steps = {}) => ({ ...course, lessons: course.lessons.map((l) => ({ ...l, guide: { ...guide[l.id], ...steps[l.id] } })) });

/**
 * The "Start here" guide shown on a course page. Every course's lessons follow the same six stages, so only
 * the introduction, what the learner needs, the order to follow and how the hands-on part is done differ.
 */
export const startGuide = ({ intro, need, order, doing, tip }) => ({
  intro,
  need,
  order,
  lesson: [
    ['Learn the words', 'Each lesson starts with its keywords, a plain-English meaning for each, and an everyday comparison. Read them first.'],
    ['See how it works', 'A short numbered list shows what happens, in order, for the idea being taught.'],
    ['Read and try', 'Short explanations with live examples. Try every one, change something, and see what happens.'],
    ['Do it yourself, step by step', doing],
    ['Practise', 'Small tasks to try alone, where the lesson has them. A hint is always available.'],
    ['Pass the quiz', 'A few questions to check the idea has landed. When the exercises and quiz are right, the lesson is marked complete.'],
  ],
  tip: tip || 'Every lesson has a checklist at the top called "Your path through this lesson". Follow it from step 1 and you will never wonder what to do next.',
});
