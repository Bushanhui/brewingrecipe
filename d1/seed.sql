-- 1. 휘뚜루마뚜루 레시피 (기존 공식)
INSERT INTO recipes VALUES ('default', '휘뚜루마뚜루 레시피', '기본', '기존 계산기 공식. Bloom 후 나머지를 3등분하여 투입', 16, 'v60');
INSERT INTO recipe_steps (recipe_id, step_order, name, type, amount_method, amount_value, wait_seconds, description) VALUES
  ('default', 1, 'Bloom', 'bloom', 'multiply_bean', 3.0, NULL, NULL),
  ('default', 2, 'First Pour', 'pour', 'ratio_of_remaining', 0.3333, NULL, NULL),
  ('default', 3, 'Second Pour', 'pour', 'ratio_of_remaining', 0.5, NULL, NULL),
  ('default', 4, 'Third Pour', 'pour', 'remainder', NULL, NULL, NULL);

-- 2. 용채 V60
INSERT INTO recipes VALUES ('yong-chae', '용채 V60', '용채', 'V60 드리퍼를 활용한 균형 잡힌 추출 레시피', 16, 'v60');
INSERT INTO recipe_steps (recipe_id, step_order, name, type, amount_method, amount_value, wait_seconds, description) VALUES
  ('yong-chae', 1, 'Bloom', 'bloom', 'multiply_bean', 2.0, NULL, NULL),
  ('yong-chae', 2, 'First Pour (to 60%)', 'pour', 'target_total_ratio', 0.6, NULL, NULL),
  ('yong-chae', 3, 'Second Pour (to 100%)', 'pour', 'remainder', NULL, NULL, NULL);

-- 3. Identity Hot (Origami)
INSERT INTO recipes VALUES ('identity-hot', 'Identity Hot', 'Identity Coffee Lab', 'Origami 드리퍼를 사용한 깔끔한 추출', 15, 'origami');
INSERT INTO recipe_steps (recipe_id, step_order, name, type, amount_method, amount_value, wait_seconds, description) VALUES
  ('identity-hot', 1, 'Bloom', 'bloom', 'multiply_bean', 2.0, NULL, NULL),
  ('identity-hot', 2, 'Main Pour (to 60%)', 'pour', 'target_total_ratio', 0.6, NULL, NULL),
  ('identity-hot', 3, 'Final Pour (to 100%)', 'pour', 'remainder', NULL, NULL, NULL);

-- 4. Bean Brothers Medium (V60)
INSERT INTO recipes VALUES ('bean-brothers', 'Bean Brothers Medium', 'Bean Brothers', 'V60으로 중배전 원두에 최적화된 레시피', 16, 'v60');
INSERT INTO recipe_steps (recipe_id, step_order, name, type, amount_method, amount_value, wait_seconds, description) VALUES
  ('bean-brothers', 1, 'Bloom', 'bloom', 'multiply_bean', 2.5, NULL, NULL),
  ('bean-brothers', 2, 'First Pour', 'pour', 'ratio_of_total', 0.4, NULL, NULL),
  ('bean-brothers', 3, 'Second Pour', 'pour', 'ratio_of_total', 0.3, NULL, NULL),
  ('bean-brothers', 4, 'Final Pour', 'pour', 'remainder', NULL, NULL, NULL);

-- 5. Tetsu Kasuya Switch
INSERT INTO recipes VALUES ('kasuya-switch', 'Tetsu Kasuya Switch', 'Tetsu Kasuya', 'Switch (침지식) 드리퍼를 활용한 4:6 변형 레시피', 15, 'switch');
INSERT INTO recipe_steps (recipe_id, step_order, name, type, amount_method, amount_value, wait_seconds, description) VALUES
  ('kasuya-switch', 1, '1st Pour (Bloom)', 'bloom', 'ratio_of_total', 0.2, NULL, NULL),
  ('kasuya-switch', 2, '2nd Pour', 'pour', 'ratio_of_total', 0.2, NULL, NULL),
  ('kasuya-switch', 3, '3rd Pour', 'pour', 'ratio_of_total', 0.2, NULL, NULL),
  ('kasuya-switch', 4, '4th Pour', 'pour', 'ratio_of_total', 0.2, NULL, NULL),
  ('kasuya-switch', 5, '5th Pour', 'pour', 'remainder', NULL, NULL, NULL);
