## 流程
- 获取 schema
  - 根据 project 找到 schema
- 导入 schema 并对着 ai copilot 执行操作的运行环境
  - 在 editor 内调用 ai copilot （类似于UI自动化的操作）
  - 统计 ai copilot 调用的信息（读 ai copilot 的数据库）
  - 切换 ai copilot 使用的模型？
- 问题生成
  - 对 ai copilot 的生成结果进行问题生成（读 ai copilot 的数据库）
  - 人工审核问题的界面
  - 提供给用户来填问题？
- Dashboard / cli 

### 开发 <br>
### Typescript <br>
### Postgres - 接 copilot 的数据库 <br>

## Table
- golden_set
  - project_ex_id text
  - schema_ex_id text
- adaptive_rubric
  - Id bigint
  - project_ex_Id text
  - schema_ex_id text
  - session_id bigint
  - content text
- adaptive_rubric_judge_record
  - adaptive_rubric_id bigint
  - account_id
  - result boolean

## Function
1. Void updateGoldgenSetProject()
2. List<schemaExId> getGoldenSetSchema()
3. Void execAiCopilotByTypeAndModel(schemaExId, AiCopilotType, Model)
4. List<AdaptiveRubric> genAdaptiveRubricsBySchemaExId(schemaExId)
5. List<AdaptiveRubric> reviewAdaptiveRubricBySchemaExId(schemaExId)
6. List<AdaptiveRubric> getAdaptiveRubricsBySchemaExId(schemaExId)
7. Boolean judge(adaptive_rubric_id, result)

### Dashboard <br>
### 展示 ai copilot 的调用信息 <br>
### 审核问题 <br>

