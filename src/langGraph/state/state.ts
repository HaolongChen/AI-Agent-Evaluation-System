import { Annotation } from '@langchain/langgraph';

export const rubricAnnotation = Annotation.Root({
  query: Annotation<string>,
  context: Annotation<string>,
  schema: Annotation<object>,

  hardConstraints: Annotation<string[]>({
    reducer: (x, y) => ({ ...x, ...y}),
  }),
  softConstraints: Annotation<string[]>({
    reducer: (x, y) => ({ ...x, ...y}),
  }),

  hardConstraintsAnswers: Annotation<boolean[]>({
    reducer: (x, y) => ({ ...x, ...y}),
  }),
  softConstraintsAnswers: Annotation<string[]>({
    reducer: (x, y) => ({ ...x, ...y}),
  }),
  
  analysis: Annotation<string>,
});
