var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-YDb0lW/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// .wrangler/tmp/pages-Uevwm6/functionsWorker-0.4649476343465422.mjs
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var urls2 = /* @__PURE__ */ new Set();
function checkURL2(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls2.has(url.toString())) {
      urls2.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL2, "checkURL");
__name2(checkURL2, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL2(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});
var onRequest = /* @__PURE__ */ __name2(async (context) => {
  const { request, env } = context;
  const { method } = request;
  const url = new URL(request.url);
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  if (method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    if (method === "GET") {
      const limit = parseInt(url.searchParams.get("limit") || "50");
      const { results } = await env.DB.prepare(
        "SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT ?"
      ).bind(limit).all();
      const parsedResults = results.map((log) => ({
        ...log,
        details: log.details && (log.details.startsWith("{") || log.details.startsWith("[")) ? JSON.parse(log.details) : log.details
      }));
      return Response.json(parsedResults, { headers: corsHeaders });
    }
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  } catch (error) {
    console.error("Activity API error:", error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}, "onRequest");
var onRequest2 = /* @__PURE__ */ __name2(async (context) => {
  const { request, env } = context;
  const { method } = request;
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  if (method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    switch (method) {
      case "GET": {
        const result = await env.DB.prepare("SELECT * FROM goals WHERE id = 1").first();
        return Response.json(result || {}, { headers: corsHeaders });
      }
      case "PUT": {
        const updates = await request.json();
        const setClauses = [];
        const values = [];
        if (updates.targetInterviews !== void 0 || updates.target_interviews !== void 0) {
          setClauses.push("target_interviews = ?");
          values.push(updates.targetInterviews || updates.target_interviews);
        }
        if (updates.targetHighScores !== void 0 || updates.target_high_scores !== void 0) {
          setClauses.push("target_high_scores = ?");
          values.push(updates.targetHighScores || updates.target_high_scores);
        }
        if (updates.targetPilots !== void 0 || updates.target_pilots !== void 0) {
          setClauses.push("target_pilots = ?");
          values.push(updates.targetPilots || updates.target_pilots);
        }
        if (updates.targetSetupTime !== void 0 || updates.target_setup_time !== void 0) {
          setClauses.push("target_setup_time = ?");
          values.push(updates.targetSetupTime || updates.target_setup_time);
        }
        if (updates.pricePoint !== void 0 || updates.price_point !== void 0) {
          setClauses.push("price_point = ?");
          values.push(updates.pricePoint || updates.price_point);
        }
        if (setClauses.length > 0) {
          setClauses.push("updated_at = ?");
          values.push((/* @__PURE__ */ new Date()).toISOString());
          const existing = await env.DB.prepare("SELECT id FROM goals WHERE id = 1").first();
          if (!existing) {
            await env.DB.prepare(`
                            INSERT INTO goals (id, target_interviews, target_high_scores, target_pilots, target_setup_time, price_point, created_at, updated_at)
                            VALUES (1, 10, 5, 3, 180, 180, ?, ?)
                        `).bind((/* @__PURE__ */ new Date()).toISOString(), (/* @__PURE__ */ new Date()).toISOString()).run();
          }
          await env.DB.prepare(`UPDATE goals SET ${setClauses.join(", ")} WHERE id = 1`).bind(...values).run();
        }
        return Response.json({ success: true }, { headers: corsHeaders });
      }
      default:
        return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    }
  } catch (error) {
    console.error("Goals API error:", error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}, "onRequest");
var onRequest3 = /* @__PURE__ */ __name2(async (context) => {
  const { request, env } = context;
  const { method } = request;
  const url = new URL(request.url);
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  if (method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    switch (method) {
      case "GET": {
        const { results } = await env.DB.prepare("SELECT * FROM interviews ORDER BY date DESC").all();
        const parsedResults = results.map((interview) => ({
          ...interview,
          questions: typeof interview.questions === "string" ? JSON.parse(interview.questions) : interview.questions || [],
          key_insights: typeof interview.key_insights === "string" ? JSON.parse(interview.key_insights) : interview.key_insights || []
        }));
        return Response.json(parsedResults, { headers: corsHeaders });
      }
      case "POST": {
        const interview = await request.json();
        const result = await env.DB.prepare(`
          INSERT INTO interviews (teacher_id, date, scheduled_date, status, duration, time_spent, setup_time, success, score, commitment, price_reaction, notes, questions, key_insights, interviewer, observer, created_at, last_modified_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          interview.teacher_id || null,
          interview.date || null,
          interview.scheduled_date || null,
          interview.status || null,
          interview.duration || null,
          interview.time_spent || null,
          interview.setup_time || null,
          interview.success || null,
          interview.score || null,
          interview.commitment || null,
          interview.price_reaction || null,
          interview.notes || null,
          interview.questions ? JSON.stringify(interview.questions) : null,
          interview.key_insights ? JSON.stringify(interview.key_insights) : null,
          interview.interviewer || null,
          interview.observer || null,
          interview.created_at || (/* @__PURE__ */ new Date()).toISOString(),
          interview.lastModifiedBy || interview.last_modified_by || null
        ).run();
        try {
          await env.DB.prepare(`
                        INSERT INTO activity_logs (user_name, action_type, entity_type, entity_id, entity_name, details)
                        VALUES (?, 'CREATE', 'INTERVIEW', ?, ?, ?)
                    `).bind(
            interview.lastModifiedBy || interview.last_modified_by || "Unknown User",
            result.meta.last_row_id,
            `Interview for Teacher ID ${interview.teacher_id}`,
            JSON.stringify({ status: interview.status, date: interview.date })
          ).run();
        } catch (logError) {
          console.error("Failed to log activity:", logError);
        }
        return Response.json({ success: true, id: result.meta.last_row_id }, { headers: corsHeaders });
      }
      case "PUT": {
        const interviewId = url.searchParams.get("id");
        const updates = await request.json();
        const setClauses = [];
        const values = [];
        if (updates.teacher_id !== void 0) {
          setClauses.push("teacher_id = ?");
          values.push(updates.teacher_id);
        }
        if (updates.date !== void 0) {
          setClauses.push("date = ?");
          values.push(updates.date);
        }
        if (updates.scheduled_date !== void 0) {
          setClauses.push("scheduled_date = ?");
          values.push(updates.scheduled_date || null);
        }
        if (updates.status !== void 0) {
          setClauses.push("status = ?");
          values.push(updates.status);
        }
        if (updates.duration !== void 0) {
          setClauses.push("duration = ?");
          values.push(updates.duration || null);
        }
        if (updates.time_spent !== void 0) {
          setClauses.push("time_spent = ?");
          values.push(updates.time_spent || null);
        }
        if (updates.setup_time !== void 0) {
          setClauses.push("setup_time = ?");
          values.push(updates.setup_time);
        }
        if (updates.success !== void 0) {
          setClauses.push("success = ?");
          values.push(updates.success);
        }
        if (updates.score !== void 0) {
          setClauses.push("score = ?");
          values.push(updates.score);
        }
        if (updates.commitment !== void 0) {
          setClauses.push("commitment = ?");
          values.push(updates.commitment);
        }
        if (updates.price_reaction !== void 0) {
          setClauses.push("price_reaction = ?");
          values.push(updates.price_reaction);
        }
        if (updates.notes !== void 0) {
          setClauses.push("notes = ?");
          values.push(updates.notes || null);
        }
        if (updates.questions !== void 0) {
          setClauses.push("questions = ?");
          values.push(JSON.stringify(updates.questions));
        }
        if (updates.key_insights !== void 0) {
          setClauses.push("key_insights = ?");
          values.push(JSON.stringify(updates.key_insights));
        }
        if (updates.interviewer !== void 0) {
          setClauses.push("interviewer = ?");
          values.push(updates.interviewer || null);
        }
        if (updates.observer !== void 0) {
          setClauses.push("observer = ?");
          values.push(updates.observer || null);
        }
        if (updates.lastModifiedBy !== void 0) {
          setClauses.push("last_modified_by = ?");
          values.push(updates.lastModifiedBy || null);
        }
        if (setClauses.length > 0) {
          await env.DB.prepare(`UPDATE interviews SET ${setClauses.join(", ")} WHERE id = ?`).bind(...values, interviewId).run();
          try {
            const userName = updates.lastModifiedBy || updates.last_modified_by || "Unknown User";
            await env.DB.prepare(`
                            INSERT INTO activity_logs (user_name, action_type, entity_type, entity_id, entity_name, details)
                            VALUES (?, 'UPDATE', 'INTERVIEW', ?, ?, ?)
                        `).bind(
              userName,
              interviewId,
              `Interview ID ${interviewId}`,
              JSON.stringify(updates)
            ).run();
          } catch (logError) {
            console.error("Failed to log activity:", logError);
          }
        }
        return Response.json({ success: true }, { headers: corsHeaders });
      }
      case "DELETE": {
        const interviewId = url.searchParams.get("id");
        await env.DB.prepare("DELETE FROM interviews WHERE id = ?").bind(interviewId).run();
        return Response.json({ success: true }, { headers: corsHeaders });
      }
      default:
        return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    }
  } catch (error) {
    console.error("Interviews API error:", error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}, "onRequest");
var onRequest4 = /* @__PURE__ */ __name2(async (context) => {
  const { request, env } = context;
  const { method } = request;
  const url = new URL(request.url);
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  if (method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    switch (method) {
      case "GET": {
        const { results } = await env.DB.prepare("SELECT * FROM tasks ORDER BY week_id, created_at").all();
        const parsedResults = results.map((task) => ({
          ...task,
          completed: task.completed === 1,
          is_default: task.is_default === 1,
          subtasks: typeof task.subtasks === "string" ? JSON.parse(task.subtasks) : task.subtasks || []
        }));
        return Response.json(parsedResults, { headers: corsHeaders });
      }
      case "POST": {
        const task = await request.json();
        await env.DB.prepare(`
          INSERT INTO tasks (id, title, notes, week_id, priority, due_date, completed, completed_at, created_at, is_default, subtasks, linked_interview_id, assignee, last_modified_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          task.id,
          task.title,
          task.notes || null,
          task.week_id,
          task.priority,
          task.due_date || null,
          task.completed ? 1 : 0,
          task.completed_at || null,
          task.created_at,
          task.is_default ? 1 : 0,
          JSON.stringify(task.subtasks || []),
          task.linked_interview_id || null,
          task.assignee || null,
          task.lastModifiedBy || task.last_modified_by || null
        ).run();
        try {
          await env.DB.prepare(`
                        INSERT INTO activity_logs (user_name, action_type, entity_type, entity_id, entity_name, details)
                        VALUES (?, 'CREATE', 'TASK', ?, ?, ?)
                    `).bind(
            task.lastModifiedBy || task.last_modified_by || "Unknown User",
            task.id,
            // Task ID is manual in this table? Or auto? The INSERT above uses `task.id`.
            task.title,
            JSON.stringify({ priority: task.priority, due_date: task.due_date })
          ).run();
        } catch (logError) {
          console.error("Failed to log activity:", logError);
        }
        return Response.json({ success: true }, { headers: corsHeaders });
      }
      case "PUT": {
        const taskId = url.searchParams.get("id");
        const updates = await request.json();
        const setClauses = [];
        const values = [];
        if (updates.title !== void 0) {
          setClauses.push("title = ?");
          values.push(updates.title);
        }
        if (updates.notes !== void 0) {
          setClauses.push("notes = ?");
          values.push(updates.notes || null);
        }
        if (updates.week_id !== void 0) {
          setClauses.push("week_id = ?");
          values.push(updates.week_id);
        }
        if (updates.priority !== void 0) {
          setClauses.push("priority = ?");
          values.push(updates.priority);
        }
        if (updates.due_date !== void 0) {
          setClauses.push("due_date = ?");
          values.push(updates.due_date || null);
        }
        if (updates.completed !== void 0) {
          setClauses.push("completed = ?");
          values.push(updates.completed ? 1 : 0);
        }
        if (updates.completed_at !== void 0) {
          setClauses.push("completed_at = ?");
          values.push(updates.completed_at || null);
        }
        if (updates.subtasks !== void 0) {
          setClauses.push("subtasks = ?");
          values.push(JSON.stringify(updates.subtasks));
        }
        if (updates.linked_interview_id !== void 0) {
          setClauses.push("linked_interview_id = ?");
          values.push(updates.linked_interview_id || null);
        }
        if (updates.assignee !== void 0) {
          setClauses.push("assignee = ?");
          values.push(updates.assignee || null);
        }
        if (updates.lastModifiedBy !== void 0) {
          setClauses.push("last_modified_by = ?");
          values.push(updates.lastModifiedBy || null);
        }
        if (setClauses.length > 0) {
          await env.DB.prepare(`UPDATE tasks SET ${setClauses.join(", ")} WHERE id = ?`).bind(...values, taskId).run();
          try {
            const userName = updates.lastModifiedBy || updates.last_modified_by || "Unknown User";
            let actionType = "UPDATE";
            if (updates.completed === true) actionType = "COMPLETE";
            await env.DB.prepare(`
                            INSERT INTO activity_logs (user_name, action_type, entity_type, entity_id, entity_name, details)
                            VALUES (?, ?, 'TASK', ?, ?, ?)
                        `).bind(
              userName,
              actionType,
              taskId,
              updates.title || `Task ID ${taskId}`,
              JSON.stringify(updates)
            ).run();
          } catch (logError) {
            console.error("Failed to log activity:", logError);
          }
        }
        return Response.json({ success: true }, { headers: corsHeaders });
      }
      case "DELETE": {
        const taskId = url.searchParams.get("id");
        await env.DB.prepare("DELETE FROM tasks WHERE id = ?").bind(taskId).run();
        return Response.json({ success: true }, { headers: corsHeaders });
      }
      default:
        return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    }
  } catch (error) {
    console.error("Tasks API error:", error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}, "onRequest");
var onRequest5 = /* @__PURE__ */ __name2(async (context) => {
  const { request, env } = context;
  const { method } = request;
  const url = new URL(request.url);
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  if (method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    switch (method) {
      case "GET": {
        const { results } = await env.DB.prepare("SELECT * FROM teachers ORDER BY created_at DESC").all();
        const mappedResults = results.map((teacher) => ({
          ...teacher,
          linkedin_message_sent: teacher.linkedin_message_sent === 1,
          email_sent: teacher.email_sent === 1,
          phone_call_made: teacher.phone_call_made === 1,
          noteLog: teacher.note_log ? JSON.parse(teacher.note_log) : []
        }));
        return Response.json(mappedResults, { headers: corsHeaders });
      }
      case "POST": {
        const teacher = await request.json();
        const result = await env.DB.prepare(`
          INSERT INTO teachers (name, designation, department, school, school_type, email, linkedin_url, request_sent_date, status, notes, note_log, created_at, contact_method, response_date, last_contact_date, next_follow_up_date, linkedin_message_sent, email_sent, phone_call_made, owner, phone_number, last_modified_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          teacher.name,
          teacher.designation || null,
          teacher.department || null,
          teacher.school,
          teacher.schoolType || teacher.school_type || null,
          // Handle both camelCase and snake_case
          teacher.email || null,
          teacher.linkedinUrl || teacher.linkedin_url || null,
          teacher.requestSentDate || teacher.request_sent_date || null,
          teacher.status,
          teacher.notes || null,
          teacher.noteLog ? JSON.stringify(teacher.noteLog) : null,
          teacher.createdAt || teacher.created_at || (/* @__PURE__ */ new Date()).toISOString(),
          teacher.contactMethod || teacher.contact_method || null,
          teacher.responseDate || teacher.response_date || null,
          teacher.lastContactDate || teacher.last_contact_date || null,
          teacher.nextFollowUpDate || teacher.next_follow_up_date || null,
          teacher.linkedinMessageSent || teacher.linkedin_message_sent ? 1 : 0,
          teacher.emailSent || teacher.email_sent ? 1 : 0,
          teacher.phoneCallMade || teacher.phone_call_made ? 1 : 0,
          teacher.owner || null,
          teacher.phoneNumber || teacher.phone_number || null,
          teacher.lastModifiedBy || teacher.last_modified_by || null
        ).run();
        try {
          await env.DB.prepare(`
                        INSERT INTO activity_logs (user_name, action_type, entity_type, entity_id, entity_name, details)
                        VALUES (?, 'CREATE', 'TEACHER', ?, ?, ?)
                    `).bind(
            teacher.lastModifiedBy || teacher.last_modified_by || "Unknown User",
            result.meta.last_row_id,
            teacher.name,
            JSON.stringify({ school: teacher.school, status: teacher.status })
          ).run();
        } catch (logError) {
          console.error("Failed to log activity:", logError);
        }
        return Response.json({ success: true, id: result.meta.last_row_id }, { headers: corsHeaders });
      }
      case "PUT": {
        const teacherId = url.searchParams.get("id");
        const updates = await request.json();
        const setClauses = [];
        const values = [];
        if (updates.name !== void 0) {
          setClauses.push("name = ?");
          values.push(updates.name);
        }
        if (updates.designation !== void 0) {
          setClauses.push("designation = ?");
          values.push(updates.designation || null);
        }
        if (updates.department !== void 0) {
          setClauses.push("department = ?");
          values.push(updates.department || null);
        }
        if (updates.school !== void 0) {
          setClauses.push("school = ?");
          values.push(updates.school);
        }
        if (updates.schoolType !== void 0 || updates.school_type !== void 0) {
          setClauses.push("school_type = ?");
          values.push(updates.schoolType || updates.school_type);
        }
        if (updates.email !== void 0) {
          setClauses.push("email = ?");
          values.push(updates.email || null);
        }
        if (updates.linkedinUrl !== void 0 || updates.linkedin_url !== void 0) {
          setClauses.push("linkedin_url = ?");
          values.push(updates.linkedinUrl || updates.linkedin_url || null);
        }
        if (updates.requestSentDate !== void 0 || updates.request_sent_date !== void 0) {
          setClauses.push("request_sent_date = ?");
          values.push(updates.requestSentDate || updates.request_sent_date || null);
        }
        if (updates.status !== void 0) {
          setClauses.push("status = ?");
          values.push(updates.status);
        }
        if (updates.notes !== void 0) {
          setClauses.push("notes = ?");
          values.push(updates.notes || null);
        }
        if (updates.noteLog !== void 0) {
          setClauses.push("note_log = ?");
          values.push(JSON.stringify(updates.noteLog));
        }
        if (updates.contactMethod !== void 0 || updates.contact_method !== void 0) {
          setClauses.push("contact_method = ?");
          values.push(updates.contactMethod || updates.contact_method || null);
        }
        if (updates.responseDate !== void 0 || updates.response_date !== void 0) {
          setClauses.push("response_date = ?");
          values.push(updates.responseDate || updates.response_date || null);
        }
        if (updates.lastContactDate !== void 0 || updates.last_contact_date !== void 0) {
          setClauses.push("last_contact_date = ?");
          values.push(updates.lastContactDate || updates.last_contact_date || null);
        }
        if (updates.nextFollowUpDate !== void 0 || updates.next_follow_up_date !== void 0) {
          setClauses.push("next_follow_up_date = ?");
          values.push(updates.nextFollowUpDate || updates.next_follow_up_date || null);
        }
        if (updates.linkedinMessageSent !== void 0 || updates.linkedin_message_sent !== void 0) {
          setClauses.push("linkedin_message_sent = ?");
          values.push(updates.linkedinMessageSent || updates.linkedin_message_sent ? 1 : 0);
        }
        if (updates.emailSent !== void 0 || updates.email_sent !== void 0) {
          setClauses.push("email_sent = ?");
          values.push(updates.emailSent || updates.email_sent ? 1 : 0);
        }
        if (updates.phoneCallMade !== void 0 || updates.phone_call_made !== void 0) {
          setClauses.push("phone_call_made = ?");
          values.push(updates.phoneCallMade || updates.phone_call_made ? 1 : 0);
        }
        if (updates.owner !== void 0) {
          setClauses.push("owner = ?");
          values.push(updates.owner || null);
        }
        if (updates.phoneNumber !== void 0 || updates.phone_number !== void 0) {
          setClauses.push("phone_number = ?");
          values.push(updates.phoneNumber || updates.phone_number || null);
        }
        if (updates.lastModifiedBy !== void 0 || updates.last_modified_by !== void 0) {
          setClauses.push("last_modified_by = ?");
          values.push(updates.lastModifiedBy || updates.last_modified_by || null);
        }
        if (setClauses.length > 0) {
          await env.DB.prepare(`UPDATE teachers SET ${setClauses.join(", ")} WHERE id = ?`).bind(...values, teacherId).run();
          try {
            const userName = updates.lastModifiedBy || updates.last_modified_by || "Unknown User";
            const entityName = updates.name || `Teacher ID ${teacherId}`;
            await env.DB.prepare(`
                            INSERT INTO activity_logs (user_name, action_type, entity_type, entity_id, entity_name, details)
                            VALUES (?, 'UPDATE', 'TEACHER', ?, ?, ?)
                        `).bind(
              userName,
              teacherId,
              entityName,
              JSON.stringify(updates)
              // Store the changes
            ).run();
          } catch (logError) {
            console.error("Failed to log activity:", logError);
          }
        }
        return Response.json({ success: true }, { headers: corsHeaders });
      }
      case "DELETE": {
        const teacherId = url.searchParams.get("id");
        await env.DB.prepare("DELETE FROM teachers WHERE id = ?").bind(teacherId).run();
        return Response.json({ success: true }, { headers: corsHeaders });
      }
      default:
        return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    }
  } catch (error) {
    console.error("Teachers API error:", error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}, "onRequest");
var routes = [
  {
    routePath: "/api/activity",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest]
  },
  {
    routePath: "/api/goals",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest2]
  },
  {
    routePath: "/api/interviews",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest3]
  },
  {
    routePath: "/api/tasks",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest4]
  },
  {
    routePath: "/api/teachers",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest5]
  }
];
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
__name2(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name2(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name2(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name2(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name2(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name2(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
__name2(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
__name2(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name2(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
__name2(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
__name2(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
__name2(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
__name2(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
__name2(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
__name2(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
__name2(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");
__name2(pathToRegexp, "pathToRegexp");
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
__name2(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name2(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name2(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name2((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
var drainBody = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
__name2(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
__name2(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
__name2(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");
__name2(__facade_invoke__, "__facade_invoke__");
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  static {
    __name(this, "___Facade_ScheduledController__");
  }
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name2(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name2(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name2(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
__name2(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name2((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name2((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
__name2(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default2 = drainBody2;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError2(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError2(e.cause)
  };
}
__name(reduceError2, "reduceError");
var jsonError2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError2(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default2 = jsonError2;

// .wrangler/tmp/bundle-YDb0lW/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__2 = [
  middleware_ensure_req_body_drained_default2,
  middleware_miniflare3_json_error_default2
];
var middleware_insertion_facade_default2 = middleware_loader_entry_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__2 = [];
function __facade_register__2(...args) {
  __facade_middleware__2.push(...args.flat());
}
__name(__facade_register__2, "__facade_register__");
function __facade_invokeChain__2(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__2(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__2, "__facade_invokeChain__");
function __facade_invoke__2(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__2(request, env, ctx, dispatch, [
    ...__facade_middleware__2,
    finalMiddleware
  ]);
}
__name(__facade_invoke__2, "__facade_invoke__");

// .wrangler/tmp/bundle-YDb0lW/middleware-loader.entry.ts
var __Facade_ScheduledController__2 = class ___Facade_ScheduledController__2 {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__2)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler2(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__2(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__2(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler2, "wrapExportedHandler");
function wrapWorkerEntrypoint2(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__2(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__2(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint2, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY2;
if (typeof middleware_insertion_facade_default2 === "object") {
  WRAPPED_ENTRY2 = wrapExportedHandler2(middleware_insertion_facade_default2);
} else if (typeof middleware_insertion_facade_default2 === "function") {
  WRAPPED_ENTRY2 = wrapWorkerEntrypoint2(middleware_insertion_facade_default2);
}
var middleware_loader_entry_default2 = WRAPPED_ENTRY2;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__2 as __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default2 as default
};
//# sourceMappingURL=functionsWorker-0.4649476343465422.js.map
