interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { results } = await context.env.DB.prepare(
    'SELECT id, name, author, description, default_ratio, dripper FROM recipes ORDER BY id'
  ).all();

  return Response.json(results);
};
