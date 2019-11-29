export interface TestRailOptions {
  domain: string;
  username: string;
  password: string;
  projectId: number;
  suiteId?: number;
  suiteIds?: number[];
  assignedToId?: number;
  usePlan?: boolean;
  runName?: string;
}

export enum Status {
  Passed = 1,
  Blocked = 2,
  Untested = 3,
  Retest = 4,
  Failed = 5,
}

export interface TestRailResult {
  case_id: number;
  status_id: Status;
  comment?: String;
}

export interface TestRailCase {
  id: number;
  title: string;
  section_id: number;
  template_id: number;
  type_id: number;
  priority_id: number;
  milestone_id?: number;
  refs?: string;
  created_by: number;
  created_on: number;
  updated_by: number;
  updated_on: number;
  estimate?: string;
  estimate_forecast?: string;
  suite_id: number;
  custom_preconds?: string;
  custom_steps?: string;
  custom_expected?: string;
  custom_steps_separated?: string;
  custom_mission?: string;
  custom_goals?: string;
}

export interface TestRailPlan {
  blocked_count: number;
  created_on: number;
  description: string;
  entries: TestRailPlanEntry[];
  failed_count: number;
  id: number;
  name: string;
  passed_count: number;
  project_id: number;
  retest_count: number;
  untested_count: number;
  url: string;
}

export interface TestRailPlanEntry {
  id: string;
  name: string;
  runs: TestRailRun[];
  suite_id: number;
}

export interface TestRailRun {
  blocked_count: number;
  config: string;
  config_ids: number[];
  created_on: number;
  description: string;
  failed_count: number;
  id: number;
  name: string;
  passed_count: number;
  plan_id: number;
  project_id: number;
  retest_count: number;
  suite_id: number;
  untested_count: number;
  url: string;
}

export interface TestRailTest {
  case_id: number;
  id: number;
  priority_id: number;
  run_id: number;
  status_id: number;
  title: string;
  type_id: number;
}
