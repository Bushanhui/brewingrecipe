interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const id = context.params.id as string;

  const recipe = await context.env.DB.prepare(
    'SELECT id, name, author, description, default_ratio, dripper FROM recipes WHERE id = ?'
  ).bind(id).first();

  if (!recipe) {
    return new Response('Recipe not found', { status: 404 });
  }

  const { results: steps } = await context.env.DB.prepare(
    'SELECT step_order, name, type, amount_method, amount_value, wait_seconds, description FROM recipe_steps WHERE recipe_id = ? ORDER BY step_order'
  ).bind(id).all();

  return Response.json({ ...recipe, steps });
};
