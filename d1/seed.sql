-- 1. 휘뚜루마뚜루 레시피 (기존 공식, 보정값 제거 버전)
INSERT INTO recipes VALUES ('default', '휘뚜루마뚜루 레시피', '기본', '기존 계산기 공식. Bloom 후 나머지를 3등분하여 투입', 16);
INSERT INTO recipe_steps VALUES (NULL, 'default', 1, 'Bloom', 'bloom', 'multiply_bean', 3.0);
INSERT INTO recipe_steps VALUES (NULL, 'default', 2, 'First Pour', 'pour', 'ratio_of_remaining', 0.3333);
INSERT INTO recipe_steps VALUES (NULL, 'default', 3, 'Second Pour', 'pour', 'ratio_of_remaining', 0.5);
INSERT INTO recipe_steps VALUES (NULL, 'default', 4, 'Third Pour', 'pour', 'remainder', NULL);

-- 2. James Hoffmann V60
INSERT INTO recipes VALUES ('hoffmann-v60', 'James Hoffmann V60', 'James Hoffmann', 'The Ultimate V60 Technique. Bloom 후 60%까지 투입, 나머지 투입', 15);
INSERT INTO recipe_steps VALUES (NULL, 'hoffmann-v60', 1, 'Bloom', 'bloom', 'multiply_bean', 2.0);
INSERT INTO recipe_steps VALUES (NULL, 'hoffmann-v60', 2, 'First Pour (to 60%)', 'pour', 'target_total_ratio', 0.6);
INSERT INTO recipe_steps VALUES (NULL, 'hoffmann-v60', 3, 'Second Pour (to 100%)', 'pour', 'remainder', NULL);

-- 3. Tetsu Kasuya 4:6 Method
INSERT INTO recipes VALUES ('kasuya-46', 'Tetsu Kasuya 4:6', 'Tetsu Kasuya', '4:6 메서드. 총 물량을 5회에 걸쳐 균등 투입. 처음 40%로 맛, 나머지 60%로 농도 조절', 15);
INSERT INTO recipe_steps VALUES (NULL, 'kasuya-46', 1, '1st Pour (Bloom)', 'bloom', 'ratio_of_total', 0.2);
INSERT INTO recipe_steps VALUES (NULL, 'kasuya-46', 2, '2nd Pour', 'pour', 'ratio_of_total', 0.2);
INSERT INTO recipe_steps VALUES (NULL, 'kasuya-46', 3, '3rd Pour', 'pour', 'ratio_of_total', 0.2);
INSERT INTO recipe_steps VALUES (NULL, 'kasuya-46', 4, '4th Pour', 'pour', 'ratio_of_total', 0.2);
INSERT INTO recipe_steps VALUES (NULL, 'kasuya-46', 5, '5th Pour', 'pour', 'remainder', NULL);

-- 4. Scott Rao V60
INSERT INTO recipes VALUES ('rao-v60', 'Scott Rao V60', 'Scott Rao', 'Bloom 후 한 번에 나머지 전량 투입하는 원푸어 방식', 16);
INSERT INTO recipe_steps VALUES (NULL, 'rao-v60', 1, 'Bloom', 'bloom', 'multiply_bean', 3.0);
INSERT INTO recipe_steps VALUES (NULL, 'rao-v60', 2, 'Main Pour', 'pour', 'remainder', NULL);
