import { onRequest as __api_goals_ts_onRequest } from "/Volumes/MaxStore/02_Current_Projects/BNE KIT VALIDATION/bne-dashboard/functions/api/goals.ts"
import { onRequest as __api_interviews_ts_onRequest } from "/Volumes/MaxStore/02_Current_Projects/BNE KIT VALIDATION/bne-dashboard/functions/api/interviews.ts"
import { onRequest as __api_tasks_ts_onRequest } from "/Volumes/MaxStore/02_Current_Projects/BNE KIT VALIDATION/bne-dashboard/functions/api/tasks.ts"
import { onRequest as __api_teachers_ts_onRequest } from "/Volumes/MaxStore/02_Current_Projects/BNE KIT VALIDATION/bne-dashboard/functions/api/teachers.ts"

export const routes = [
    {
      routePath: "/api/goals",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_goals_ts_onRequest],
    },
  {
      routePath: "/api/interviews",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_interviews_ts_onRequest],
    },
  {
      routePath: "/api/tasks",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_tasks_ts_onRequest],
    },
  {
      routePath: "/api/teachers",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_teachers_ts_onRequest],
    },
  ]