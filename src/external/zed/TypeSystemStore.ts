import { gql } from "graphql-request";
import { ZTypeSystem, type OpaqueSchemaGraph } from "./TypeSystem.ts";

import { authState, backendClient, gqlRequest } from "../graphql-client.ts";
import { Crdt } from "@functorz/crdt-helper";
import { login } from "../login.ts";
import { FUNCTORZ_PHONE_NUMBER, FUNCTORZ_PASSWORD } from "../../config/env.ts";
import { fromUint8Array } from "js-base64";
import type { AfCustomCodeTemplates_visibleAfCustomCodeTemplates } from "./AfCustomCodeTemplates.ts";
import type { SupportedCustomModelDescriptor_supportedCustomModelDescriptor } from "./ZSchema.ts";
import { getSchemaModel } from "../ali-oss.ts";
import { assertNotNull, genExtraContext } from './helpers.ts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LatestSchema {
	crdtModelUrl: string;
	crdtPatches?: {
		lastPatchExId: string;
		patches: Array<{ patchBase64: string }>;
	};
}

interface FetchAppDetailResponse {
	fetchAppDetailByExId?: {
		latestSchema?: LatestSchema;
	};
}

interface FetchAppDetailVariables {
	projectExId: string;
	appExId: null;
	appVersionExId: null;
}

interface AfCustomCodeTemplatesResponse {
	visibleAfCustomCodeTemplates: AfCustomCodeTemplates_visibleAfCustomCodeTemplates[];
}

interface SupportedCustomModelDescriptorResponse {
	supportedCustomModelDescriptor: SupportedCustomModelDescriptor_supportedCustomModelDescriptor;
}

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

const FETCH_APP_DETAIL_QUERY = gql`
	query FetchAppDetailByExId(
		$projectExId: String!
		$appExId: String
		$appVersionExId: String
	) {
		fetchAppDetailByExId(
			projectExId: $projectExId
			appExId: $appExId
			appVersionExId: $appVersionExId
		) {
			... on WechatMiniProgramApp {
				latestSchema {
					crdtModelUrl
					crdtPatches {
						lastPatchExId
						patches {
							patchBase64
						}
					}
				}
			}
			... on Project {
				latestSchema {
					crdtModelUrl
					crdtPatches {
						lastPatchExId
						patches {
							patchBase64
						}
					}
				}
			}
			... on WebApp {
				latestSchema {
					crdtModelUrl
					crdtPatches {
						lastPatchExId
						patches {
							patchBase64
						}
					}
				}
			}
		}
	}
`;

const AF_CUSTOM_CODE_TEMPLATES_QUERY = gql`
	query AfCustomCodeTemplates {
		visibleAfCustomCodeTemplates {
			async
			exId
			author
			displayName
			inputType {
				... on NodeTemplateVariable {
					name
					type
					defaultValue
					required
					description
				}
			}
			logoUrl
			outputType {
				... on NodeTemplateVariable {
					name
					type
					defaultValue
					required
					description
				}
			}
			status
			templateGroup
			updatedAt
			version
		}
	}
`;

const SUPPORTED_CUSTOM_MODEL_DESCRIPTOR_QUERY = gql`
	query SupportedCustomModelDescriptor {
		supportedCustomModelDescriptor {
			chatModelDescriptors
			embeddingModelDescriptors
		}
	}
`;

// ---------------------------------------------------------------------------
// TypeSystemStore
// ---------------------------------------------------------------------------

export class TypeSystemStore {
	private currSchemaGraph: OpaqueSchemaGraph | null = null;
	public afCustomCodeTemplates: AfCustomCodeTemplates_visibleAfCustomCodeTemplates[] =
		[];
	public supportedCustomModelDescriptor: SupportedCustomModelDescriptor_supportedCustomModelDescriptor | null =
		null;

	get schemaGraph(): OpaqueSchemaGraph | null {
		return this.currSchemaGraph;
	}

	private async ensureAuthenticated(): Promise<void> {
		if (authState.isValid()) {
			console.info("Access token is still valid");
			return;
		}

		console.info("Access token expired or missing, logging in...");

		if (!FUNCTORZ_PHONE_NUMBER || !FUNCTORZ_PASSWORD) {
			throw new Error(
				"Missing FUNCTORZ_PHONE_NUMBER or FUNCTORZ_PASSWORD in environment variables",
			);
		}

		const accessToken = await login(FUNCTORZ_PHONE_NUMBER, FUNCTORZ_PASSWORD);
		authState.setToken(accessToken);
		console.info("Successfully authenticated");
	}

	async fetchAppDetailByExId(
		projectExId: string,
	): Promise<LatestSchema | null> {
		try {
			await this.ensureAuthenticated();

			const data = await gqlRequest<
				FetchAppDetailResponse,
				FetchAppDetailVariables
			>(backendClient, FETCH_APP_DETAIL_QUERY, {
				projectExId,
				appExId: null,
				appVersionExId: null,
			});

			const latestSchema = data.fetchAppDetailByExId?.latestSchema;
			console.info("GraphQL response for fetchAppDetailByExId:", data);

			if (latestSchema) {
				console.info("Fetched latestSchema:", latestSchema);
				return latestSchema;
			} else {
				console.error("No latestSchema found for project:", projectExId);
				console.debug("All information:");
				return null;
			}
		} catch (error) {
			console.error("Error fetching app detail:", error);
			throw error;
		}
	}

	async getAFCustomCodeTemplates(): Promise<
		AfCustomCodeTemplates_visibleAfCustomCodeTemplates[]
	> {
		try {
			if (this.afCustomCodeTemplates.length > 0)
				return this.afCustomCodeTemplates;
			await this.ensureAuthenticated();

			const data = await gqlRequest<AfCustomCodeTemplatesResponse>(
				backendClient,
				AF_CUSTOM_CODE_TEMPLATES_QUERY,
			);

			this.afCustomCodeTemplates = data.visibleAfCustomCodeTemplates;
			return this.afCustomCodeTemplates;
		} catch (error) {
			console.error("Error fetching AF custom code templates:", error);
			throw error;
		}
	}

	async getSupportedCustomModelDescriptor(): Promise<SupportedCustomModelDescriptor_supportedCustomModelDescriptor> {
		try {
			if (this.supportedCustomModelDescriptor)
				return this.supportedCustomModelDescriptor;
			await this.ensureAuthenticated();

			const data = await gqlRequest<SupportedCustomModelDescriptorResponse>(
				backendClient,
				SUPPORTED_CUSTOM_MODEL_DESCRIPTOR_QUERY,
			);

			this.supportedCustomModelDescriptor = data.supportedCustomModelDescriptor;
			return this.supportedCustomModelDescriptor;
		} catch (error) {
			console.error("Error fetching supported custom model descriptor:", error);
			throw error;
		}
	}

	async rehydrate(schemaId: string): Promise<OpaqueSchemaGraph> {
		const arrayBuffer = await getSchemaModel(schemaId);
		const modelBinary = new Uint8Array(arrayBuffer);

		console.debug("step 2 done, modelBinary length: " + modelBinary.length);

		const binaryBase64 = fromUint8Array(modelBinary);
		// Use Crdt.initModel which handles base64 conversion internally
		const model = Crdt.initModel(binaryBase64);

		// 4. Get the schema JSON
		const schemaJson = model.view();

		// 5. Merge with backend-only schema if needed
		const fullSchema = {
			...schemaJson,
			// server: latestBackendOnlyAppSchema, // For non-backend-editable apps
		};

		// 6. Parse to ZSchema and create SchemaGraph
		const zSchema = ZTypeSystem.parseZSchemaFromJsObject(fullSchema);
		const schemaGraph = this.withEnabledFeatures<OpaqueSchemaGraph>(() => {
			const extraContext = genExtraContext(
				this.supportedCustomModelDescriptor,
				this.afCustomCodeTemplates,
			);
			return ZTypeSystem.resolveZSchemaToSchemaGraph(
				assertNotNull(zSchema),
				extraContext,
			);
		});
		this.currSchemaGraph = schemaGraph;
		return schemaGraph;
	}

	public withEnabledFeatures = <T>(func: () => T): T => {
		return ZTypeSystem.withEnabledFeatures<T>([], func);
	};
}
