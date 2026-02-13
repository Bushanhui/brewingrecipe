DROP TABLE IF EXISTS recipe_steps;
DROP TABLE IF EXISTS recipes;

CREATE TABLE recipes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  default_ratio REAL NOT NULL
);

CREATE TABLE recipe_steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  amount_method TEXT NOT NULL,
  amount_value REAL,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id)
);
