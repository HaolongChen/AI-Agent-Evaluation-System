import { Annotation } from '@langchain/langgraph';
import { BaseMessage } from '@langchain/core/messages';

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

  messages: Annotation<BaseMessage[]>({
    default: () => [],
    reducer: (x, y) => x.concat(y),
  }),
});
