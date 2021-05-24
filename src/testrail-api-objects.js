module.exports = {
  TestRailOptions: {
    domain: null,
    username: null,
    password: null,
    projectId: -1,
    suiteId: null,
    suiteIds: [],
    assignedToId: null,
    usePlan: null,
    runName: null
  },

  Status: {
    passed: 1,
    blocked: 2,
    untested: 3,
    retest: 4,
    failed: 5
  },

  TestRailResult: {
    case_id: -1,
    status_id: 0,
    comment: null
  },

  TestRailCase: {
    id: -1,
    title: null,
    section_id: -1,
    template_id: -1,
    type_id: -1,
    priority_id: -1,
    milestone_id: null,
    refs: null,
    created_by: -1,
    created_on: -1,
    updated_by: -1,
    updated_on: -1,
    estimate: null,
    estimate_forecast: null,
    suite_id: -1,
    custom_preconds: null,
    custom_steps: null,
    custom_expected: null,
    custom_steps_separated: null,
    custom_mission: null,
    custom_goals: null
  },

  TestRailPlan: {
    blocked_count: -1,
    created_on: -1,
    description: null,
    entries: [],
    failed_count: -1,
    id: -1,
    name: null,
    passed_count: -1,
    project_id: -1,
    retest_count: -1,
    untested_count: -1,
    url: null
  },

  TestRailPlanEntry: {
    id: null,
    name: null,
    runs: [],
    suite_id: -1
  },

  TestRailRun: {
    blocked_count: -1,
    config: null,
    config_ids: [],
    created_on: -1,
    description: null,
    failed_count: -1,
    id: -1,
    name: null,
    passed_count: -1,
    plan_id: -1,
    project_id: -1,
    retest_count: -1,
    suite_id: -1,
    untested_count: -1,
    url: null
  },

  TestRailTest: {
    case_id: -1,
    id: -1,
    priority_id: -1,
    run_id: -1,
    status_id: -1,
    title: null,
    type_id: -1
  }
}
