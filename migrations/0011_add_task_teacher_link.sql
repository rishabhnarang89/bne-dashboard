-- Add linked_teacher_id column to tasks table
ALTER TABLE tasks ADD COLUMN linked_teacher_id INTEGER;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_tasks_linked_teacher_id ON tasks(linked_teacher_id);
