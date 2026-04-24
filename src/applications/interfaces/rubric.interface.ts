import z from "zod";
import { rubricEntity } from "../../entities/rubric.entity.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const rubricEntityWithCriteriaOnly = rubricEntity
	.pick({ internal: true })
	.extend({
		external: z.object({
			criterion: rubricEntity.shape.external.shape.criterion,
		}),
  } );

const criterionWithoutId= rubricEntity.shape.external.shape.criterion.element.omit( { id: true} )

export interface IRubricRepository {
	createRubricWithCriterion(
		criterion: z.infer<typeof criterionWithoutId>,
	): Promise<z.infer<typeof rubricEntityWithCriteriaOnly>>;
}
