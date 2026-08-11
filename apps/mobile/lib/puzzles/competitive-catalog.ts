import type { PuzzleDef } from './types';

/**
 * Imported from Competitive_Exam_Practice_Set_100_Harder_Puzzles (2).docx.
 * The source advertises 100 questions but contains 98: Section 2 Q30 and
 * Section 4 Q20 are absent. Section 1 Q27's contradictory row was corrected.
 */
export const COMPETITIVE_PUZZLES = [
  {
    "id": "competitive-s1-q1",
    "number": 17,
    "grade": "Competitive",
    "title": "Visual & Spatial Reasoning · 1",
    "prompt": "A large cube of side 5 units is formed by stacking 125 unit cubes and painted red on all six outer faces before being disassembled. How many unit cubes have paint on EXACTLY two faces?",
    "hint": "Sketch the arrangement and track only the information that changes.",
    "answer": "cubes with exactly 2 painted faces lie on the edges of the cube (excluding corners). There are 12 edges, each with (5−2)=3 such cubes: 12 × 3 = 36.",
    "topic": "Spatial Reasoning",
    "kind": "mcq",
    "options": [
      "24",
      "36",
      "48",
      "54"
    ],
    "correctOptionIndex": 1
  },
  {
    "id": "competitive-s1-q2",
    "number": 18,
    "grade": "Competitive",
    "title": "Visual & Spatial Reasoning · 2",
    "prompt": "A cube of side 6 units is painted on all faces and cut into 216 unit cubes. How many unit cubes have NO paint on any face?",
    "hint": "Sketch the arrangement and track only the information that changes.",
    "answer": "unpainted cubes form an inner (n−2)³ cube: (6−2)³ = 4³ = 64.",
    "topic": "Spatial Reasoning",
    "kind": "mcq",
    "options": [
      "48",
      "56",
      "64",
      "72"
    ],
    "correctOptionIndex": 2
  },
  {
    "id": "competitive-s1-q3",
    "number": 19,
    "grade": "Competitive",
    "title": "Visual & Spatial Reasoning · 3",
    "prompt": "A cuboid measuring 4 × 3 × 2 units is painted on all outer faces and cut into unit cubes. How many unit cubes have paint on EXACTLY one face?",
    "hint": "Sketch the arrangement and track only the information that changes.",
    "answer": "one-face-painted cubes occur only in the interior of each face. On the two 4×3 faces: (4−2)(3−2)=2 each → 4 total. The 3×2 faces give (3−2)(2−2)=0, and the 4×2 faces give (4−2)(2−2)=0. Total = 4.",
    "topic": "Spatial Reasoning",
    "kind": "mcq",
    "options": [
      "2",
      "4",
      "6",
      "8"
    ],
    "correctOptionIndex": 1
  },
  {
    "id": "competitive-s1-q4",
    "number": 20,
    "grade": "Competitive",
    "title": "Visual & Spatial Reasoning · 4",
    "prompt": "A fair die has 1 opposite 6, 2 opposite 5, and 3 opposite 4. It starts with 1 on top, 2 facing North, 3 facing East, and is rolled (tipped over an edge, without slipping) in this sequence: North, North, East, South. What number is on TOP after all four rolls?",
    "hint": "Sketch the arrangement and track only the information that changes.",
    "answer": "tracking (Top,Bottom,North,South,East,West) through each roll: Start (1,6,2,5,3,4) → Roll N: (5,2,1,6,3,4) → Roll N: (6,1,5,2,3,4) → Roll E: (4,3,5,2,6,1) → Roll S: (5,2,3,4,6,1). The final top face is 5 (consistent check: every opposite pair still sums to 7).",
    "topic": "Spatial Reasoning",
    "kind": "mcq",
    "options": [
      "2",
      "3",
      "4",
      "5"
    ],
    "correctOptionIndex": 3
  },
  {
    "id": "competitive-s1-q5",
    "number": 21,
    "grade": "Competitive",
    "title": "Visual & Spatial Reasoning · 5",
    "prompt": "A cuboid of dimensions 6 × 5 × 4 units is painted on the outside and cut into unit cubes. How many unit cubes have paint on AT LEAST one face?",
    "hint": "Sketch the arrangement and track only the information that changes.",
    "answer": "total cubes = 120. Fully interior (unpainted) cubes = (6−2)(5−2)(4−2) = 4×3×2 = 24. At least one face painted = 120 − 24 = 96.",
    "topic": "Spatial Reasoning",
    "kind": "mcq",
    "options": [
      "88",
      "92",
      "96",
      "100"
    ],
    "correctOptionIndex": 2
  },
  {
    "id": "competitive-s1-q6",
    "number": 22,
    "grade": "Competitive",
    "title": "Visual & Spatial Reasoning · 6",
    "prompt": "In a sequence of figures, a triangle rotates 45° clockwise at every step AND alternates between fully shaded and half-shaded at every step. Figure 1 is a fully-shaded triangle pointing due North (0°). What is the orientation and shading of Figure 7?",
    "hint": "Sketch the arrangement and track only the information that changes.",
    "answer": "rotation at figure n is (n−1)×45°; for n=7 this is 270°. Shading alternates full/half starting 'full' at n=1 (odd numbers), so figure 7 (odd) is fully shaded.",
    "topic": "Spatial Reasoning",
    "kind": "mcq",
    "options": [
      "225°, half-shaded",
      "270°, fully shaded",
      "315°, half-shaded",
      "270°, half-shaded"
    ],
    "correctOptionIndex": 1
  },
  {
    "id": "competitive-s1-q7",
    "number": 23,
    "grade": "Competitive",
    "title": "Visual & Spatial Reasoning · 7",
    "prompt": "A wire is bent into a regular hexagon of side 6 cm. The same wire is straightened and re-bent into a square. Find the side of the square, and state whether the enclosed area increases or decreases, and by roughly how much.",
    "hint": "Sketch the arrangement and track only the information that changes.",
    "answer": "perimeter = 36 cm in both cases, so the square's side = 9 cm (area 81 cm²). The hexagon's area = (3√3/2)(6²) = 54√3 ≈ 93.53 cm². The area decreases by about 93.53 − 81 ≈ 12.53 cm².",
    "topic": "Spatial Reasoning",
    "kind": "mcq",
    "options": [
      "Side 8 cm; area increases by ~10 cm²",
      "Side 9 cm; area decreases by ~12.5 cm²",
      "Side 9 cm; area increases by ~12.5 cm²",
      "Side 10 cm; area decreases by ~20 cm²"
    ],
    "correctOptionIndex": 1
  },
  {
    "id": "competitive-s1-q8",
    "number": 24,
    "grade": "Competitive",
    "title": "Visual & Spatial Reasoning · 8",
    "prompt": "What is the maximum number of non-overlapping regions into which a plane can be divided by 6 straight lines, given no two lines are parallel and no three lines meet at a single point?",
    "hint": "Sketch the arrangement and track only the information that changes.",
    "answer": "the maximum number of regions formed by n lines in general position is 1 + n(n+1)/2. For n=6: 1 + 21 = 22.",
    "topic": "Spatial Reasoning",
    "kind": "mcq",
    "options": [
      "16",
      "19",
      "22",
      "26"
    ],
    "correctOptionIndex": 2
  },
  {
    "id": "competitive-s1-q9",
    "number": 25,
    "grade": "Competitive",
    "title": "Visual & Spatial Reasoning · 9",
    "prompt": "A circular pizza is cut with 8 straight cuts (chords), where every pair of cuts intersects inside the circle and no three cuts pass through a single point. What is the MAXIMUM number of pieces obtainable?",
    "hint": "Sketch the arrangement and track only the information that changes.",
    "answer": "using the same formula as for lines dividing a plane, maximum pieces = 1 + n(n+1)/2. For n=8: 1 + 36 = 37.",
    "topic": "Spatial Reasoning",
    "kind": "mcq",
    "options": [
      "29",
      "33",
      "37",
      "41"
    ],
    "correctOptionIndex": 2
  },
  {
    "id": "competitive-s1-q10",
    "number": 26,
    "grade": "Competitive",
    "title": "Visual & Spatial Reasoning · 10",
    "prompt": "A clock's reflection in a vertical mirror placed to its right shows the time as 4:20. What is the ACTUAL time on the clock?",
    "hint": "Sketch the arrangement and track only the information that changes.",
    "answer": "for a standard analogue clock reflected in a vertical mirror, actual time + mirror-image time = 12:00. So actual time = 12:00 − 4:20 = 7:40.",
    "topic": "Spatial Reasoning",
    "kind": "mcq",
    "options": [
      "7:20",
      "7:40",
      "8:20",
      "8:40"
    ],
    "correctOptionIndex": 1
  },
  {
    "id": "competitive-s1-q11",
    "number": 27,
    "grade": "Competitive",
    "title": "Visual & Spatial Reasoning · 11",
    "prompt": "A square sheet of paper is folded in half three times in succession (vertical, then horizontal, then vertical again), forming a smaller rectangle with 8 layers. A hole is punched through all the layers at a point that is NOT on any fold crease. How many holes appear when the sheet is fully unfolded?",
    "hint": "Sketch the arrangement and track only the information that changes.",
    "answer": "each fold doubles the number of layers (2³ = 8 layers after 3 folds). Since the punch point avoids every crease, all 8 layers get distinct, non-overlapping holes when unfolded.",
    "topic": "Spatial Reasoning",
    "kind": "mcq",
    "options": [
      "4",
      "6",
      "8",
      "16"
    ],
    "correctOptionIndex": 2
  },
  {
    "id": "competitive-s1-q12",
    "number": 28,
    "grade": "Competitive",
    "title": "Visual & Spatial Reasoning · 12",
    "prompt": "Equal right-angled isosceles triangles are cut off from all four corners of a square sheet of side 12 cm so that the remaining figure is a REGULAR octagon. Find the side length of the octagon (to 2 decimal places).",
    "hint": "Sketch the arrangement and track only the information that changes.",
    "answer": "let x be the leg of each cut-off triangle. The octagon's side equals both the hypotenuse (x√2) and the leftover straight portion (12−2x) of the original edge. Setting x√2 = 12−2x gives x = 12/(2+√2) ≈ 3.515 cm, so the octagon's side = x√2 ≈ 4.97 cm.",
    "topic": "Spatial Reasoning",
    "kind": "mcq",
    "options": [
      "4.32 cm",
      "4.97 cm",
      "5.15 cm",
      "5.52 cm"
    ],
    "correctOptionIndex": 1
  },
  {
    "id": "competitive-s1-q13",
    "number": 29,
    "grade": "Competitive",
    "title": "Visual & Spatial Reasoning · 13",
    "prompt": "A cube of side 4 units is painted BLUE on the top and bottom faces and RED on the four remaining (side) faces, then cut into 64 unit cubes. How many unit cubes have exactly one red face AND exactly one blue face?",
    "hint": "Sketch the arrangement and track only the information that changes.",
    "answer": "such cubes lie on the 8 edges where a blue face meets a red face (the 4 edges bordering the top face and the 4 bordering the bottom face). Each such edge has (4−2)=2 non-corner cubes: 8 × 2 = 16.",
    "topic": "Spatial Reasoning",
    "kind": "mcq",
    "options": [
      "8",
      "12",
      "16",
      "20"
    ],
    "correctOptionIndex": 2
  },
  {
    "id": "competitive-s1-q14",
    "number": 30,
    "grade": "Competitive",
    "title": "Visual & Spatial Reasoning · 14",
    "prompt": "Three different views of the same standard die are observed: View 1 shows 1 on top, 2 in front, 3 on the right. View 2 shows 4 on top, 1 in front, 6 on the right. View 3 shows 6 on top, 5 in front, 2 on the right. Which number is opposite to 1?",
    "hint": "Sketch the arrangement and track only the information that changes.",
    "answer": "from View 1, faces 2 and 3 are adjacent to 1. From View 2, faces 4 and 6 are adjacent to 1. That accounts for four distinct faces (2, 3, 4, 6) adjacent to face 1; since each face has exactly one opposite face, the only remaining number, 5, must be opposite to 1.",
    "topic": "Spatial Reasoning",
    "kind": "mcq",
    "options": [
      "3",
      "4",
      "5",
      "6"
    ],
    "correctOptionIndex": 2
  },
  {
    "id": "competitive-s1-q15",
    "number": 31,
    "grade": "Competitive",
    "title": "Visual & Spatial Reasoning · 15",
    "prompt": "A survey of 100 students found: 50 like Mathematics, 40 like Physics, 30 like Chemistry, 20 like both Mathematics and Physics, 15 like both Physics and Chemistry, 10 like both Mathematics and Chemistry, and 5 like all three. How many students like NONE of the three subjects?",
    "hint": "Sketch the arrangement and track only the information that changes.",
    "answer": "by inclusion-exclusion, students liking at least one subject = 50+40+30−20−15−10+5 = 80. Students liking none = 100 − 80 = 20.",
    "topic": "Spatial Reasoning",
    "kind": "mcq",
    "options": [
      "10",
      "15",
      "20",
      "25"
    ],
    "correctOptionIndex": 2
  },
  {
    "id": "competitive-s1-q16",
    "number": 32,
    "grade": "Competitive",
    "title": "Visual & Spatial Reasoning · 16",
    "prompt": "A convex polygon has exactly 170 diagonals. How many sides does it have, and into how many triangles would it be divided if triangulated from a single vertex?",
    "hint": "Sketch the arrangement and track only the information that changes.",
    "answer": "diagonals of an n-sided polygon = n(n−3)/2 = 170, giving n² − 3n − 340 = 0, whose positive root is n = 20. Triangulating from one vertex always gives (n−2) triangles = 18.",
    "topic": "Spatial Reasoning",
    "kind": "mcq",
    "options": [
      "18 sides, 16 triangles",
      "19 sides, 17 triangles",
      "20 sides, 18 triangles",
      "22 sides, 20 triangles"
    ],
    "correctOptionIndex": 2
  },
  {
    "id": "competitive-s1-q17",
    "number": 33,
    "grade": "Competitive",
    "title": "Visual & Spatial Reasoning · 17",
    "prompt": "Which of the following capital letters does NOT possess both a horizontal AND a vertical line of symmetry: H, I, O, X, M?",
    "hint": "Sketch the arrangement and track only the information that changes.",
    "answer": "M has a vertical line of symmetry (left-right mirror) but lacks a horizontal line of symmetry, since its top (two peaks) does not mirror its flat bottom. H, I, O and X all have both.",
    "topic": "Spatial Reasoning",
    "kind": "mcq",
    "options": [
      "H",
      "I",
      "X",
      "M"
    ],
    "correctOptionIndex": 3
  },
  {
    "id": "competitive-s1-q18",
    "number": 34,
    "grade": "Competitive",
    "title": "Visual & Spatial Reasoning · 18",
    "prompt": "A figure sequence starts with a square (0° rotation, flat side down). At each step the shape gains one more side (square → pentagon → hexagon → …) AND rotates a further 20° clockwise from the previous figure. What shape and total rotation (from the start) appears at the 6th figure?",
    "hint": "Sketch the arrangement and track only the information that changes.",
    "answer": "figure n has (n+3) sides and rotation (n−1)×20°. For n=6: sides = 9 (a nonagon) and rotation = 5×20° = 100°.",
    "topic": "Spatial Reasoning",
    "kind": "mcq",
    "options": [
      "Octagon, 80°",
      "Nonagon, 100°",
      "Nonagon, 120°",
      "Decagon, 100°"
    ],
    "correctOptionIndex": 1
  },
  {
    "id": "competitive-s1-q19",
    "number": 35,
    "grade": "Competitive",
    "title": "Visual & Spatial Reasoning · 19",
    "prompt": "A goat is tied to a corner of a square field of side 8 m with a rope 12 m long, and can graze only OUTSIDE the field. Find the total area it can graze. (Use π = 22/7)",
    "hint": "Sketch the arrangement and track only the information that changes.",
    "answer": "since the rope (12 m) is longer than the side (8 m), the goat sweeps a 270° sector of radius 12 m at the tied corner, plus a 90° sector of radius (12−8)=4 m at each of the two adjacent corners (where the rope wraps around). Area = (3/4)π(12²) + 2×(1/4)π(4²) = (3/4)(22/7)(144) + (1/2)(22/7)(16) = 339 3/7 + 25 1/7 = 364 4/7 m².",
    "topic": "Spatial Reasoning",
    "kind": "mcq",
    "options": [
      "339 3/7 m²",
      "352 m²",
      "364 4/7 m²",
      "376 m²"
    ],
    "correctOptionIndex": 2
  },
  {
    "id": "competitive-s1-q20",
    "number": 36,
    "grade": "Competitive",
    "title": "Visual & Spatial Reasoning · 20",
    "prompt": "A snail sits at the bottom of a 30-foot well. Each day it climbs 5 feet, but each night it slips back 3 feet (it does not slip once it has reached or crossed the top). On which day does the snail first reach the top?",
    "hint": "Sketch the arrangement and track only the information that changes.",
    "answer": "net progress per full day-night cycle is 2 feet. After 13 nights, the snail is at 26 feet; on Day 14's climb it reaches 26+5 = 31 feet, crossing the 30-foot mark before it can slip back.",
    "topic": "Spatial Reasoning",
    "kind": "mcq",
    "options": [
      "Day 13",
      "Day 14",
      "Day 15",
      "Day 27"
    ],
    "correctOptionIndex": 1
  },
  {
    "id": "competitive-s1-q21",
    "number": 37,
    "grade": "Competitive",
    "title": "Visual & Spatial Reasoning · 21",
    "prompt": "Eight people sit around a circular table facing the centre, equally spaced (seats labelled clockwise). E sits directly opposite A. D sits immediately to the right (clockwise) of E. C sits two seats to the right (clockwise) of D. B sits immediately to the left (anticlockwise) of C. F sits directly opposite B. Two seats remain unassigned (for G and H). Who sits immediately to the left of A?",
    "hint": "Sketch the arrangement and track only the information that changes.",
    "answer": "number seats 1–8 clockwise with A=1. Then E (opposite A) = 5, D (right of E) = 6, C (two seats right of D) = 8, B (left of C) = 7, F (opposite B) = 3. The seat immediately left (anticlockwise) of A (seat 1) is seat 8, which is occupied by C.",
    "topic": "Spatial Reasoning",
    "kind": "mcq",
    "options": [
      "B",
      "C",
      "D",
      "F"
    ],
    "correctOptionIndex": 1
  },
  {
    "id": "competitive-s1-q22",
    "number": 38,
    "grade": "Competitive",
    "title": "Visual & Spatial Reasoning · 22",
    "prompt": "Using exactly 6 matchsticks of equal length, is it possible to form 4 equilateral triangles such that every matchstick is a side of at least one triangle? If so, what solid is formed?",
    "hint": "Sketch the arrangement and track only the information that changes.",
    "answer": "arranging the 6 matchsticks as the 6 edges of a (3-dimensional) regular tetrahedron creates 4 equilateral triangular faces, using each matchstick exactly once.",
    "topic": "Spatial Reasoning",
    "kind": "mcq",
    "options": [
      "No, it is impossible",
      "Yes, a square pyramid",
      "Yes, a regular tetrahedron",
      "Yes, an octahedron"
    ],
    "correctOptionIndex": 2
  },
  {
    "id": "competitive-s1-q23",
    "number": 39,
    "grade": "Competitive",
    "title": "Visual & Spatial Reasoning · 23",
    "prompt": "When ALL the diagonals of a regular hexagon are drawn, into how many non-overlapping regions is its interior divided?",
    "hint": "Sketch the arrangement and track only the information that changes.",
    "answer": "a regular hexagon has 9 diagonals, but the 3 main (long) diagonals are concurrent at the centre rather than crossing pairwise. Careful analysis (via Euler's formula: V=19, E=42, giving 24 bounded interior faces) confirms the hexagon is divided into exactly 24 regions — fewer than the 25 that would result if no three diagonals were concurrent.",
    "topic": "Spatial Reasoning",
    "kind": "mcq",
    "options": [
      "20",
      "22",
      "24",
      "25"
    ],
    "correctOptionIndex": 2
  },
  {
    "id": "competitive-s1-q24",
    "number": 40,
    "grade": "Competitive",
    "title": "Visual & Spatial Reasoning · 24",
    "prompt": "A regular polygon has a number of diagonals that is exactly three times the number of its sides. How many sides does the polygon have?",
    "hint": "Sketch the arrangement and track only the information that changes.",
    "answer": "diagonals = n(n−3)/2 = 3n. Simplifying (n≠0): n−3 = 6, so n = 9. Check: a 9-sided polygon has 9×6/2 = 27 diagonals = 3×9. ✓",
    "topic": "Spatial Reasoning",
    "kind": "mcq",
    "options": [
      "7",
      "8",
      "9",
      "10"
    ],
    "correctOptionIndex": 2
  },
  {
    "id": "competitive-s1-q25",
    "number": 41,
    "grade": "Competitive",
    "title": "Visual & Spatial Reasoning · 25",
    "prompt": "At what time between 4 and 5 o'clock will the hour hand and the minute hand of a clock first be exactly opposite each other (180° apart)?",
    "hint": "Sketch the arrangement and track only the information that changes.",
    "answer": "t minutes after 4:00, the hour hand is at (120 + 0.5t)° and the minute hand at 6t°. Setting 6t − (120+0.5t) = 180 gives 5.5t = 300, so t = 54 6/11 minutes.",
    "topic": "Spatial Reasoning",
    "kind": "mcq",
    "options": [
      "4:45 5/11",
      "4:50 2/11",
      "4:54 6/11",
      "4:58 8/11"
    ],
    "correctOptionIndex": 2
  },
  {
    "id": "competitive-s1-q26",
    "number": 42,
    "grade": "Competitive",
    "title": "Visual & Spatial Reasoning · 26",
    "prompt": "Ten coins are arranged in a triangle pointing upward, with 1, 2, 3, and 4 coins in successive rows (a triangle of side 4). What is the MINIMUM number of coins that must be moved (by sliding, without disturbing the others) to make the triangle point downward instead, keeping the same size and shape?",
    "hint": "Sketch the arrangement and track only the information that changes.",
    "answer": "this is a classic result: for a side-4 triangular arrangement of 10 coins/balls, the minimum number of coins that must be relocated to invert the triangle's orientation is 3.",
    "topic": "Spatial Reasoning",
    "kind": "mcq",
    "options": [
      "2",
      "3",
      "4",
      "5"
    ],
    "correctOptionIndex": 1
  },
  {
    "id": "competitive-s1-q27",
    "number": 43,
    "grade": "Competitive",
    "title": "Visual & Spatial Reasoning · 27",
    "prompt": "A 3×3 grid follows a Sudoku-like rule: every row and every column contains exactly one Circle, one Square, and one Triangle. Row 1 = Circle, Square, Triangle. Row 2 = Square, Triangle, Circle. Row 3 = Triangle, ?, Square. What shape belongs in Row 3, Column 2?",
    "hint": "Sketch the arrangement and track only the information that changes.",
    "answer": "Column 2 already has Square (Row 1) and Triangle (Row 2), so the only shape available for Row 3 is Circle.",
    "topic": "Spatial Reasoning",
    "kind": "mcq",
    "options": [
      "Circle",
      "Square",
      "Triangle",
      "Cannot be determined"
    ],
    "correctOptionIndex": 0
  },
  {
    "id": "competitive-s1-q28",
    "number": 44,
    "grade": "Competitive",
    "title": "Visual & Spatial Reasoning · 28",
    "prompt": "A 2×2 grid has exactly one quadrant shaded. In each successive figure, the shaded quadrant rotates 90° clockwise (top-left → top-right → bottom-right → bottom-left → top-left …). If the shaded quadrant is top-left in Figure 1, which quadrant is shaded in Figure 10?",
    "hint": "Sketch the arrangement and track only the information that changes.",
    "answer": "the cycle length is 4; Figure 10 corresponds to position ((10−1) mod 4) = 1 in the cycle (0-indexed), i.e. the 2nd position, which is top-right.",
    "topic": "Spatial Reasoning",
    "kind": "mcq",
    "options": [
      "Top-left",
      "Top-right",
      "Bottom-right",
      "Bottom-left"
    ],
    "correctOptionIndex": 1
  },
  {
    "id": "competitive-s1-q29",
    "number": 45,
    "grade": "Competitive",
    "title": "Visual & Spatial Reasoning · 29",
    "prompt": "A person starts facing North, turns 90° clockwise, then 180°, and finally 90° anticlockwise. He then walks forward and turns to face directly away from his starting direction. Which direction is he now facing?",
    "hint": "Sketch the arrangement and track only the information that changes.",
    "answer": "North(0°)+90°cw=East(90°); +180°=West(270°); −90°(acw)=South(180°). Facing 'directly away' from South means facing North (the opposite direction), so the final direction is North.",
    "topic": "Spatial Reasoning",
    "kind": "mcq",
    "options": [
      "North",
      "East",
      "South",
      "West"
    ],
    "correctOptionIndex": 0
  },
  {
    "id": "competitive-s1-q30",
    "number": 46,
    "grade": "Competitive",
    "title": "Visual & Spatial Reasoning · 30",
    "prompt": "What is the minimum number of straight cuts needed to divide a circular cake into exactly 11 pieces, if every pair of cuts must intersect inside the circle and no three cuts may meet at one point?",
    "hint": "Sketch the arrangement and track only the information that changes.",
    "answer": "using the maximum-regions formula 1 + n(n+1)/2: for n=4, this gives 1+10=11 pieces, the smallest n for which the count reaches (or exceeds) 11.",
    "topic": "Spatial Reasoning",
    "kind": "mcq",
    "options": [
      "4",
      "5",
      "6",
      "7"
    ],
    "correctOptionIndex": 0
  },
  {
    "id": "competitive-s2-q1",
    "number": 47,
    "grade": "Competitive",
    "title": "Logical & Analytical Reasoning · 1",
    "prompt": "The present ages of A and B are in the ratio 5:6. Eight years ago, the ratio of their ages was 3:4. Find the SUM of their present ages.",
    "hint": "List the constraints first, then eliminate impossible cases.",
    "answer": "let present ages be 5x and 6x. (5x−8)/(6x−8) = 3/4 gives 20x−32 = 18x−24, so x=4. Ages are 20 and 24; sum = 44.",
    "topic": "Logical Reasoning",
    "kind": "mcq",
    "options": [
      "40",
      "44",
      "48",
      "52"
    ],
    "correctOptionIndex": 1
  },
  {
    "id": "competitive-s2-q2",
    "number": 48,
    "grade": "Competitive",
    "title": "Logical & Analytical Reasoning · 2",
    "prompt": "The sum of the present ages of a father, mother, and son is 92 years. Five years ago, the ratio of the father's age to the son's age was 7:2. The mother is presently 3 years younger than the father. Find the present age of the son.",
    "hint": "List the constraints first, then eliminate impossible cases.",
    "answer": "let ages 5 years ago be 7k (father) and 2k (son). Present ages: father=7k+5, son=2k+5, mother=(7k+5)−3=7k+2. Sum: (7k+5)+(2k+5)+(7k+2)=16k+12=92, so k=5. Son's present age = 2(5)+5 = 15.",
    "topic": "Logical Reasoning",
    "kind": "mcq",
    "options": [
      "10",
      "12",
      "15",
      "18"
    ],
    "correctOptionIndex": 2
  },
  {
    "id": "competitive-s2-q3",
    "number": 49,
    "grade": "Competitive",
    "title": "Logical & Analytical Reasoning · 3",
    "prompt": "A and B together can finish a work in 12 days. B and C together finish it in 15 days. A and C together finish it in 20 days. In how many days can A ALONE finish the work?",
    "hint": "List the constraints first, then eliminate impossible cases.",
    "answer": "adding all three equations: 2(1/A+1/B+1/C) = 1/12+1/15+1/20 = 12/60 = 1/5, so 1/A+1/B+1/C = 1/10. Then 1/A = 1/10 − 1/15 = 1/30, so A alone takes 30 days.",
    "topic": "Logical Reasoning",
    "kind": "mcq",
    "options": [
      "24",
      "27",
      "30",
      "36"
    ],
    "correctOptionIndex": 2
  },
  {
    "id": "competitive-s2-q4",
    "number": 50,
    "grade": "Competitive",
    "title": "Logical & Analytical Reasoning · 4",
    "prompt": "A boat travels 30 km upstream and 44 km downstream in 10 hours; it also travels 40 km upstream and 55 km downstream in 13 hours. Find the speed of the boat in still water.",
    "hint": "List the constraints first, then eliminate impossible cases.",
    "answer": "let x=1/(upstream speed), y=1/(downstream speed). From the two equations, 30x+44y=10 and 40x+55y=13, solving gives x=1/5, y=1/11, so upstream speed=5 km/hr and downstream speed=11 km/hr. Boat speed in still water = (5+11)/2 = 8 km/hr (stream speed = 3 km/hr).",
    "topic": "Logical Reasoning",
    "kind": "mcq",
    "options": [
      "6 km/hr",
      "7 km/hr",
      "8 km/hr",
      "9 km/hr"
    ],
    "correctOptionIndex": 2
  },
  {
    "id": "competitive-s2-q5",
    "number": 51,
    "grade": "Competitive",
    "title": "Logical & Analytical Reasoning · 5",
    "prompt": "A vessel contains milk and water in the ratio 5:3. When 16 litres of the mixture is removed and replaced with pure water, the new ratio of milk to water becomes 5:7. Find the original quantity of mixture in the vessel.",
    "hint": "List the constraints first, then eliminate impossible cases.",
    "answer": "let the total be 8x (milk 5x, water 3x). Removing 16 L takes out 10 L milk and 6 L water; adding 16 L pure water gives milk=5x−10, water=3x+10. Setting (5x−10)/(3x+10)=5/7 gives x=6, so total = 8x = 48 litres.",
    "topic": "Logical Reasoning",
    "kind": "mcq",
    "options": [
      "32 L",
      "40 L",
      "48 L",
      "56 L"
    ],
    "correctOptionIndex": 2
  },
  {
    "id": "competitive-s2-q6",
    "number": 52,
    "grade": "Competitive",
    "title": "Logical & Analytical Reasoning · 6",
    "prompt": "In the cryptarithm BASE + BALL = GAMES, each letter stands for a unique digit (0–9) and no number has a leading zero. Find the value of GAMES.",
    "hint": "List the constraints first, then eliminate impossible cases.",
    "answer": "the unique solution is B=7, A=4, S=8, E=3, L=5, G=1, M=9, giving BASE=7483, BALL=7455, and their sum GAMES=14938.",
    "topic": "Logical Reasoning",
    "kind": "mcq",
    "options": [
      "13984",
      "14938",
      "15827",
      "16745"
    ],
    "correctOptionIndex": 1
  },
  {
    "id": "competitive-s2-q7",
    "number": 53,
    "grade": "Competitive",
    "title": "Logical & Analytical Reasoning · 7",
    "prompt": "In how many ways can the letters of the word 'ORANGE' be arranged so that all the vowels occupy ONLY the odd positions (1st, 3rd, 5th)?",
    "hint": "List the constraints first, then eliminate impossible cases.",
    "answer": "ORANGE has 3 vowels (O,A,E) and 3 consonants (R,N,G). The 3 vowels can be arranged in the 3 odd positions in 3!=6 ways, and the 3 consonants in the 3 even positions in 3!=6 ways: 6×6=36.",
    "topic": "Logical Reasoning",
    "kind": "mcq",
    "options": [
      "12",
      "18",
      "24",
      "36"
    ],
    "correctOptionIndex": 3
  },
  {
    "id": "competitive-s2-q8",
    "number": 54,
    "grade": "Competitive",
    "title": "Logical & Analytical Reasoning · 8",
    "prompt": "Three fair dice are rolled together. What is the probability that the sum of the numbers obtained is exactly 10?",
    "hint": "List the constraints first, then eliminate impossible cases.",
    "answer": "out of 216 equally likely outcomes, exactly 27 combinations give a sum of 10 (a known result for 3 dice). Probability = 27/216 = 1/8.",
    "topic": "Logical Reasoning",
    "kind": "mcq",
    "options": [
      "1/9",
      "1/8",
      "5/36",
      "1/6"
    ],
    "correctOptionIndex": 1
  },
  {
    "id": "competitive-s2-q9",
    "number": 55,
    "grade": "Competitive",
    "title": "Logical & Analytical Reasoning · 9",
    "prompt": "In how many ways can 6 people be seated around a circular table such that two particular people do NOT sit next to each other?",
    "hint": "List the constraints first, then eliminate impossible cases.",
    "answer": "total circular arrangements of 6 people = (6−1)! = 120. Arrangements with the two together (treating them as one block) = (5−1)!×2 = 48. Arrangements with them apart = 120−48 = 72.",
    "topic": "Logical Reasoning",
    "kind": "mcq",
    "options": [
      "48",
      "60",
      "72",
      "96"
    ],
    "correctOptionIndex": 2
  },
  {
    "id": "competitive-s2-q10",
    "number": 56,
    "grade": "Competitive",
    "title": "Logical & Analytical Reasoning · 10",
    "prompt": "Find the smallest positive integer that leaves a remainder of 2 when divided by 3, a remainder of 3 when divided by 4, a remainder of 4 when divided by 5, and a remainder of 5 when divided by 6.",
    "hint": "List the constraints first, then eliminate impossible cases.",
    "answer": "in every case, the remainder is exactly one less than the divisor, so the number is 1 less than a common multiple of 3, 4, 5, and 6. LCM(3,4,5,6)=60, so the smallest such number is 60−1=59.",
    "topic": "Logical Reasoning",
    "kind": "mcq",
    "options": [
      "39",
      "49",
      "59",
      "119"
    ],
    "correctOptionIndex": 2
  },
  {
    "id": "competitive-s2-q11",
    "number": 57,
    "grade": "Competitive",
    "title": "Logical & Analytical Reasoning · 11",
    "prompt": "A group of 150 people were surveyed: 80 read Newspaper A, 70 read B, 60 read C, 30 read both A and B, 25 read both B and C, 20 read both A and C, and 10 read all three. How many people read EXACTLY ONE newspaper?",
    "hint": "List the constraints first, then eliminate impossible cases.",
    "answer": "Exactly A = 80−30−20+10=40; Exactly B = 70−30−25+10=25; Exactly C = 60−25−20+10=25. Total exactly one = 40+25+25 = 90.",
    "topic": "Logical Reasoning",
    "kind": "mcq",
    "options": [
      "80",
      "85",
      "90",
      "95"
    ],
    "correctOptionIndex": 2
  },
  {
    "id": "competitive-s2-q12",
    "number": 58,
    "grade": "Competitive",
    "title": "Logical & Analytical Reasoning · 12",
    "prompt": "A sum invested at compound interest (compounded annually) amounts to ₹4,840 in 2 years and ₹5,324 in 3 years. Find the rate of interest and the original principal.",
    "hint": "List the constraints first, then eliminate impossible cases.",
    "answer": "the ratio of successive amounts gives (1+r) = 5324/4840 = 1.1, so r=10%. Then P(1.1)²=4840 gives P=4000.",
    "topic": "Logical Reasoning",
    "kind": "mcq",
    "options": [
      "8%, ₹4200",
      "9%, ₹4100",
      "10%, ₹4000",
      "12%, ₹3800"
    ],
    "correctOptionIndex": 2
  },
  {
    "id": "competitive-s2-q13",
    "number": 59,
    "grade": "Competitive",
    "title": "Logical & Analytical Reasoning · 13",
    "prompt": "Two trains, 120 m and 180 m long, run on parallel tracks. Running in the SAME direction, the faster train passes the slower one in 30 seconds. Running in OPPOSITE directions, they cross each other in 6 seconds. Find the speed of the faster train (in km/hr).",
    "hint": "List the constraints first, then eliminate impossible cases.",
    "answer": "let speeds be x, y (m/s), x>y, combined length=300 m. Same direction: 300/(x−y)=30 → x−y=10. Opposite direction: 300/(x+y)=6 → x+y=50. Solving: x=30 m/s = 108 km/hr, y=20 m/s = 72 km/hr.",
    "topic": "Logical Reasoning",
    "kind": "mcq",
    "options": [
      "90 km/hr",
      "96 km/hr",
      "102 km/hr",
      "108 km/hr"
    ],
    "correctOptionIndex": 3
  },
  {
    "id": "competitive-s2-q14",
    "number": 60,
    "grade": "Competitive",
    "title": "Logical & Analytical Reasoning · 14",
    "prompt": "Using Zeller's Congruence (or the doomsday method), determine the day of the week for 15th August 1947.",
    "hint": "List the constraints first, then eliminate impossible cases.",
    "answer": "applying Zeller's congruence for 15 August 1947 (q=15, m=8, K=47, J=19) gives h=(15+23+47+11+4−38) mod 7 = 62 mod 7 = 6, which corresponds to Friday. (This matches the well-documented historical fact that India's Independence Day fell on a Friday.)",
    "topic": "Logical Reasoning",
    "kind": "mcq",
    "options": [
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday"
    ],
    "correctOptionIndex": 1
  },
  {
    "id": "competitive-s2-q15",
    "number": 61,
    "grade": "Competitive",
    "title": "Logical & Analytical Reasoning · 15",
    "prompt": "Find the next term: 4, 9, 25, 49, 121, ?",
    "hint": "List the constraints first, then eliminate impossible cases.",
    "answer": "the terms are squares of consecutive prime numbers: 2², 3², 5², 7², 11², 13² → 169.",
    "topic": "Logical Reasoning",
    "kind": "mcq",
    "options": [
      "144",
      "169",
      "196",
      "225"
    ],
    "correctOptionIndex": 1
  },
  {
    "id": "competitive-s2-q16",
    "number": 62,
    "grade": "Competitive",
    "title": "Logical & Analytical Reasoning · 16",
    "prompt": "A four-digit palindrome (reads the same forwards and backwards) has a digit sum of 18, and its first digit is exactly twice its second digit. Find the number.",
    "hint": "List the constraints first, then eliminate impossible cases.",
    "answer": "a 4-digit palindrome has the form abba, with digit sum 2(a+b)=18, so a+b=9. Given a=2b: 3b=9, so b=3, a=6. The number is 6336.",
    "topic": "Logical Reasoning",
    "kind": "mcq",
    "options": [
      "4224",
      "5115",
      "6336",
      "7227"
    ],
    "correctOptionIndex": 2
  },
  {
    "id": "competitive-s2-q17",
    "number": 63,
    "grade": "Competitive",
    "title": "Logical & Analytical Reasoning · 17",
    "prompt": "A and B start from the same point on a circular track of circumference 600 m, walking in OPPOSITE directions at 5 m/s and 7 m/s respectively. After how many seconds will they meet for the THIRD time?",
    "hint": "List the constraints first, then eliminate impossible cases.",
    "answer": "moving in opposite directions, their relative speed is 12 m/s, and they meet each time their combined distance covered equals a multiple of 600 m. The third meeting occurs when combined distance = 1800 m, so time = 1800/12 = 150 seconds.",
    "topic": "Logical Reasoning",
    "kind": "mcq",
    "options": [
      "100 s",
      "125 s",
      "150 s",
      "175 s"
    ],
    "correctOptionIndex": 2
  },
  {
    "id": "competitive-s2-q18",
    "number": 64,
    "grade": "Competitive",
    "title": "Logical & Analytical Reasoning · 18",
    "prompt": "A, B, and C invest ₹4000, ₹6000, and ₹8000 respectively in a business, for periods of 8, 6, and 9 months respectively. If the total profit at the end of the year is ₹35,000, find C's share.",
    "hint": "List the constraints first, then eliminate impossible cases.",
    "answer": "profit shares are proportional to (investment × time): A:32000, B:36000, C:72000, simplifying to the ratio 8:9:18 (35 parts total). Each part = 35000/35 = ₹1000, so C's share = 18×1000 = ₹18,000.",
    "topic": "Logical Reasoning",
    "kind": "mcq",
    "options": [
      "₹14,000",
      "₹16,000",
      "₹18,000",
      "₹20,000"
    ],
    "correctOptionIndex": 2
  },
  {
    "id": "competitive-s2-q19",
    "number": 65,
    "grade": "Competitive",
    "title": "Logical & Analytical Reasoning · 19",
    "prompt": "Find the next term: 2, 5, 10, 17, 26, 37, ?",
    "hint": "List the constraints first, then eliminate impossible cases.",
    "answer": "each term equals n²+1 for n=1,2,3,…: 1²+1=2, 2²+1=5, …, 7²+1=50.",
    "topic": "Logical Reasoning",
    "kind": "mcq",
    "options": [
      "46",
      "48",
      "50",
      "52"
    ],
    "correctOptionIndex": 2
  },
  {
    "id": "competitive-s2-q20",
    "number": 66,
    "grade": "Competitive",
    "title": "Logical & Analytical Reasoning · 20",
    "prompt": "On an island, every inhabitant is either a Knight (always tells the truth) or a Knave (always lies). A says, 'B is a Knave.' B says, 'A and C are of the same type (both Knights or both Knaves).' What can be determined with certainty about C?",
    "hint": "List the constraints first, then eliminate impossible cases.",
    "answer": "testing both possibilities for A: if A is a Knight, B is indeed a Knave (as A truthfully says), so B's statement is false, meaning A and C are of DIFFERENT types; since A is a Knight, C must be a Knave. If A is a Knave, then B (contradicting A's false claim) is a Knight, so B's statement is true, meaning A and C are the SAME type; since A is a Knave, C is also a Knave. Either way, C is a Knave.",
    "topic": "Logical Reasoning",
    "kind": "mcq",
    "options": [
      "C is a Knight",
      "C is a Knave",
      "C could be either",
      "No conclusion possible"
    ],
    "correctOptionIndex": 1
  },
  {
    "id": "competitive-s2-q21",
    "number": 67,
    "grade": "Competitive",
    "title": "Logical & Analytical Reasoning · 21",
    "prompt": "A man travels from city X to city Y at 40 km/hr and returns from Y to X at 60 km/hr. Find his AVERAGE speed for the entire round trip.",
    "hint": "List the constraints first, then eliminate impossible cases.",
    "answer": "for equal distances at two different speeds, average speed = 2ab/(a+b) = 2×40×60/100 = 48 km/hr (NOT the simple average of 50 km/hr, which is a common mistake).",
    "topic": "Logical Reasoning",
    "kind": "mcq",
    "options": [
      "45 km/hr",
      "48 km/hr",
      "50 km/hr",
      "52 km/hr"
    ],
    "correctOptionIndex": 1
  },
  {
    "id": "competitive-s2-q22",
    "number": 68,
    "grade": "Competitive",
    "title": "Logical & Analytical Reasoning · 22",
    "prompt": "A shopkeeper mixes three varieties of rice costing ₹20, ₹25, and ₹30 per kg in the ratio 2:3:5 by weight. Find the cost per kg of the resulting mixture.",
    "hint": "List the constraints first, then eliminate impossible cases.",
    "answer": "weighted average = (2×20 + 3×25 + 5×30)/(2+3+5) = (40+75+150)/10 = 265/10 = ₹26.50.",
    "topic": "Logical Reasoning",
    "kind": "mcq",
    "options": [
      "₹25.00",
      "₹26.00",
      "₹26.50",
      "₹27.00"
    ],
    "correctOptionIndex": 2
  },
  {
    "id": "competitive-s2-q23",
    "number": 69,
    "grade": "Competitive",
    "title": "Logical & Analytical Reasoning · 23",
    "prompt": "From a standard well-shuffled deck of 52 cards, 4 cards are drawn at random. What is the probability that all four are of DIFFERENT suits?",
    "hint": "List the constraints first, then eliminate impossible cases.",
    "answer": "favourable outcomes = 13×13×13×13 = 13⁴ = 28561 (one card from each suit). Total ways to choose 4 cards = C(52,4) = 270725. The probability simplifies to 2197/20825 ≈ 0.1055.",
    "topic": "Logical Reasoning",
    "kind": "mcq",
    "options": [
      "2197/20825",
      "1/24",
      "13/204",
      "1/16"
    ],
    "correctOptionIndex": 0
  },
  {
    "id": "competitive-s2-q24",
    "number": 70,
    "grade": "Competitive",
    "title": "Logical & Analytical Reasoning · 24",
    "prompt": "An item's marked price is 40% above its cost price. After two successive discounts of 10% and 15% on the marked price, it is sold for ₹1071. Find the cost price.",
    "hint": "List the constraints first, then eliminate impossible cases.",
    "answer": "final price = CP × 1.40 × 0.90 × 0.85 = CP × 1.071. Setting this equal to 1071 gives CP = ₹1000.",
    "topic": "Logical Reasoning",
    "kind": "mcq",
    "options": [
      "₹900",
      "₹950",
      "₹1000",
      "₹1050"
    ],
    "correctOptionIndex": 2
  },
  {
    "id": "competitive-s2-q25",
    "number": 71,
    "grade": "Competitive",
    "title": "Logical & Analytical Reasoning · 25",
    "prompt": "A trader spends exactly ₹740 buying pens at ₹18 each and pencils at ₹7 each (buying at least one of each). The number of pens bought is more than the number of pencils, and the number of pencils is at least 20. Find the number of pens and pencils bought.",
    "hint": "List the constraints first, then eliminate impossible cases.",
    "answer": "solving 18p+7c=740 for positive integers with p>c≥20 gives the unique solution p=31, c=26 (checking: 18×31+7×26 = 558+182 = 740 ✓; the other integer solution, p=38,c=8, is excluded since it violates c≥20).",
    "topic": "Logical Reasoning",
    "kind": "mcq",
    "options": [
      "24 pens, 44 pencils",
      "31 pens, 26 pencils",
      "38 pens, 8 pencils",
      "10 pens, 80 pencils"
    ],
    "correctOptionIndex": 1
  },
  {
    "id": "competitive-s2-q26",
    "number": 72,
    "grade": "Competitive",
    "title": "Logical & Analytical Reasoning · 26",
    "prompt": "In a standard 3×3 magic square (numbers 1–9, every row/column/diagonal summing to 15), the number 2 is placed in the top-right corner. What number must occupy the bottom-left corner?",
    "hint": "List the constraints first, then eliminate impossible cases.",
    "answer": "the top-right and bottom-left corners lie on the same diagonal as the centre (which is always 5 in a 3×3 magic square). Since that diagonal sums to 15, the bottom-left corner = 15 − 5 − 2 = 8.",
    "topic": "Logical Reasoning",
    "kind": "mcq",
    "options": [
      "4",
      "6",
      "7",
      "8"
    ],
    "correctOptionIndex": 3
  },
  {
    "id": "competitive-s2-q27",
    "number": 73,
    "grade": "Competitive",
    "title": "Logical & Analytical Reasoning · 27",
    "prompt": "A sequence is defined by T₁=3, T₂=7, and Tₙ = Tₙ₋₁ + Tₙ₋₂ + 2 for n≥3. Find T₆.",
    "hint": "List the constraints first, then eliminate impossible cases.",
    "answer": "computing successively: T₃=7+3+2=12, T₄=12+7+2=21, T₅=21+12+2=35, T₆=35+21+2=58.",
    "topic": "Logical Reasoning",
    "kind": "mcq",
    "options": [
      "46",
      "52",
      "58",
      "64"
    ],
    "correctOptionIndex": 2
  },
  {
    "id": "competitive-s2-q28",
    "number": 74,
    "grade": "Competitive",
    "title": "Logical & Analytical Reasoning · 28",
    "prompt": "Pipe A can fill a tank in 20 hours; Pipe B can empty a full tank in 30 hours. Both are opened together, but Pipe B is closed after 10 hours. How much MORE time will Pipe A alone take to completely fill the tank?",
    "hint": "List the constraints first, then eliminate impossible cases.",
    "answer": "in 10 hours, the combined (fill−empty) rate fills 10×(1/20−1/30)=10×(1/60)=1/6 of the tank. The remaining 5/6 is filled by Pipe A alone at 1/20 per hour, taking (5/6)÷(1/20) = 100/6 = 16⅔ hours.",
    "topic": "Logical Reasoning",
    "kind": "mcq",
    "options": [
      "15 hours",
      "16⅔ hours",
      "18 hours",
      "20 hours"
    ],
    "correctOptionIndex": 1
  },
  {
    "id": "competitive-s2-q29",
    "number": 75,
    "grade": "Competitive",
    "title": "Logical & Analytical Reasoning · 29",
    "prompt": "In how many ways can 5 letters be placed into 5 distinctly addressed envelopes (one letter per envelope) such that NO letter goes into its correctly addressed envelope?",
    "hint": "List the constraints first, then eliminate impossible cases.",
    "answer": "this is the derangement D₅ = 5!×(1−1/1!+1/2!−1/3!+1/4!−1/5!) = 120 × (11/30) = 44.",
    "topic": "Logical Reasoning",
    "kind": "mcq",
    "options": [
      "24",
      "36",
      "44",
      "60"
    ],
    "correctOptionIndex": 2
  },
  {
    "id": "competitive-s3-q1",
    "number": 76,
    "grade": "Competitive",
    "title": "Mathematics Olympiad · 1",
    "prompt": "Let f: ℝ → ℝ satisfy f(x+y) = f(x) + f(y) + xy for all real x, y, and f(1) = 1. Find f(10).",
    "hint": "Look for a useful identity, invariant, or extremal case.",
    "answer": "55\n\nTrying f(x) = x²/2 + cx satisfies the functional equation for any constant c (since f(x+y)−f(x)−f(y) = xy holds identically). Using f(1)=1: 1/2+c=1, so c=1/2, giving f(x) = x(x+1)/2. Then f(10) = 10×11/2 = 55.",
    "topic": "Mathematics"
  },
  {
    "id": "competitive-s3-q2",
    "number": 77,
    "grade": "Competitive",
    "title": "Mathematics Olympiad · 2",
    "prompt": "If a, b, c are positive real numbers with a+b+c=9, find the MAXIMUM possible value of abc.",
    "hint": "Look for a useful identity, invariant, or extremal case.",
    "answer": "27 (attained when a=b=c=3)\n\nBy the AM-GM inequality, (a+b+c)/3 ≥ (abc)^(1/3), so abc ≤ ((a+b+c)/3)³ = 3³ = 27, with equality when a=b=c=3.",
    "topic": "Mathematics"
  },
  {
    "id": "competitive-s3-q3",
    "number": 78,
    "grade": "Competitive",
    "title": "Mathematics Olympiad · 3",
    "prompt": "Find the smallest positive integer N such that N leaves remainder 5 when divided by 7, remainder 7 when divided by 9, and remainder 9 when divided by 11.",
    "hint": "Look for a useful identity, invariant, or extremal case.",
    "answer": "691\n\nIn every case the remainder is exactly 2 less than the divisor, so N ≡ −2 (mod 7, 9, and 11). Thus N+2 is divisible by lcm(7,9,11) = 693. The smallest positive N is 693−2 = 691.",
    "topic": "Mathematics"
  },
  {
    "id": "competitive-s3-q4",
    "number": 79,
    "grade": "Competitive",
    "title": "Mathematics Olympiad · 4",
    "prompt": "What is the minimum number of people needed in a room to GUARANTEE that at least 3 of them were born in the same month?",
    "hint": "Look for a useful identity, invariant, or extremal case.",
    "answer": "25\n\nBy the pigeonhole principle, with 12 months (pigeonholes), to force at least 3 people into some month, we need more than 2×12=24 people, i.e., at least 25.",
    "topic": "Mathematics"
  },
  {
    "id": "competitive-s3-q5",
    "number": 80,
    "grade": "Competitive",
    "title": "Mathematics Olympiad · 5",
    "prompt": "Two circles of radii 8 cm and 3 cm have their centres 13 cm apart. Find the length of their DIRECT common tangent.",
    "hint": "Look for a useful identity, invariant, or extremal case.",
    "answer": "12 cm\n\nFor two circles with centre distance d and radii r₁, r₂, the direct common tangent length = √(d² − (r₁−r₂)²) = √(13² − 5²) = √(169−25) = √144 = 12.",
    "topic": "Mathematics"
  },
  {
    "id": "competitive-s3-q6",
    "number": 81,
    "grade": "Competitive",
    "title": "Mathematics Olympiad · 6",
    "prompt": "A sequence satisfies a₁=1, a₂=3, and aₙ = 3aₙ₋₁ − 2aₙ₋₂ for n≥3. Find a₆.",
    "hint": "Look for a useful identity, invariant, or extremal case.",
    "answer": "63\n\nThe characteristic equation x²−3x+2=0 factors as (x−1)(x−2)=0, giving general solution aₙ = A + B·2ⁿ. Using a₁=1, a₂=3: A+2B=1, A+4B=3, giving B=1, A=−1, so aₙ = 2ⁿ−1. Thus a₆ = 2⁶−1 = 63 (verified directly: 1,3,7,15,31,63,…).",
    "topic": "Mathematics"
  },
  {
    "id": "competitive-s3-q7",
    "number": 82,
    "grade": "Competitive",
    "title": "Mathematics Olympiad · 7",
    "prompt": "Find all positive integers n such that n² + 24 is a perfect square, and give the SUM of all such values of n.",
    "hint": "Look for a useful identity, invariant, or extremal case.",
    "answer": "n=1 and n=5; sum = 6\n\nLet n²+24=k², so (k−n)(k+n)=24. Since k−n and k+n must have the same parity and their product is even, both must be even. Checking even factor pairs of 24 with k−n < k+n: (2,12) gives n=5, k=7; (4,6) gives n=1, k=5. These are the only solutions. Verification: 1²+24=25=5², 5²+24=49=7².",
    "topic": "Mathematics"
  },
  {
    "id": "competitive-s3-q8",
    "number": 83,
    "grade": "Competitive",
    "title": "Mathematics Olympiad · 8",
    "prompt": "In triangle ABC, D and E lie on AB and AC respectively with DE parallel to BC, and AD:DB = 2:3. Find the ratio of the area of triangle ADE to the area of quadrilateral DBCE.",
    "hint": "Look for a useful identity, invariant, or extremal case.",
    "answer": "4 : 21\n\nSince DE∥BC, triangle ADE ~ triangle ABC with ratio AD:AB = 2:5. So area(ADE):area(ABC) = 4:25. Taking area(ABC)=25 units, area(ADE)=4, so area(DBCE)=25−4=21. The required ratio is 4:21.",
    "topic": "Mathematics"
  },
  {
    "id": "competitive-s3-q9",
    "number": 84,
    "grade": "Competitive",
    "title": "Mathematics Olympiad · 9",
    "prompt": "How many distinct necklaces can be made using 4 red beads and 2 blue beads (6 beads total) arranged in a circle, where rotations are considered identical but reflections are considered different?",
    "hint": "Look for a useful identity, invariant, or extremal case.",
    "answer": "3 distinct necklaces\n\nUsing Burnside's lemma over the cyclic group C₆ of rotations: identity fixes C(6,2)=15 arrangements; rotations by 1 and 5 positions fix 0 (would require all beads identical); rotations by 2 and 4 positions (each splitting the necklace into 2 cycles of length 3) fix 0 (2 blue beads can't be split into multiples of 3 per cycle); rotation by 3 positions (splitting into 3 cycles of length 2) fixes 3 arrangements (choose which of the 3 cycles is blue). Average = (15+0+0+3+0+0)/6 = 18/6 = 3.",
    "topic": "Mathematics"
  },
  {
    "id": "competitive-s3-q10",
    "number": 85,
    "grade": "Competitive",
    "title": "Mathematics Olympiad · 10",
    "prompt": "A factory has machines A, B, and C producing 25%, 35%, and 40% of total output, with defect rates 5%, 4%, and 2% respectively. If a randomly chosen item is found defective, find the probability it was produced by machine C.",
    "hint": "Look for a useful identity, invariant, or extremal case.",
    "answer": "16/69 ≈ 0.232 (about 23.2%)\n\nUsing Bayes' theorem: P(defective) = 0.25×0.05 + 0.35×0.04 + 0.40×0.02 = 0.0125+0.014+0.008 = 0.0345. P(C | defective) = 0.008/0.0345 = 16/69 ≈ 0.232.",
    "topic": "Mathematics"
  },
  {
    "id": "competitive-s3-q11",
    "number": 86,
    "grade": "Competitive",
    "title": "Mathematics Olympiad · 11",
    "prompt": "If x+y+z=6, xy+yz+zx=11, and xyz=6, find the value of x³+y³+z³.",
    "hint": "Look for a useful identity, invariant, or extremal case.",
    "answer": "36\n\nUsing x²+y²+z² = (x+y+z)²−2(xy+yz+zx) = 36−22=14, and the identity x³+y³+z³−3xyz = (x+y+z)(x²+y²+z²−xy−yz−zx) = 6×(14−11) = 18. So x³+y³+z³ = 18+3(6) = 36. (Indeed x,y,z are the roots 1, 2, 3 of t³−6t²+11t−6=0, and 1³+2³+3³=1+8+27=36.)",
    "topic": "Mathematics"
  },
  {
    "id": "competitive-s3-q12",
    "number": 87,
    "grade": "Competitive",
    "title": "Mathematics Olympiad · 12",
    "prompt": "Find the last two digits of 7^2023.",
    "hint": "Look for a useful identity, invariant, or extremal case.",
    "answer": "43\n\nWe need 7^2023 mod 100. Computing powers of 7 mod 100: 7¹=7, 7²=49, 7³=43, 7⁴=1 (mod 100) — so 7 has order 4 modulo 100. Since 2023 mod 4 = 3, 7^2023 ≡ 7³ ≡ 43 (mod 100).",
    "topic": "Mathematics"
  },
  {
    "id": "competitive-s3-q13",
    "number": 88,
    "grade": "Competitive",
    "title": "Mathematics Olympiad · 13",
    "prompt": "ABCD is a cyclic quadrilateral with AB=5, BC=6, CD=7, DA=8. Using Ptolemy's theorem (AC×BD = AB×CD + BC×DA), find the product of its diagonals AC×BD.",
    "hint": "Look for a useful identity, invariant, or extremal case.",
    "answer": "83\n\nBy Ptolemy's theorem: AC×BD = AB×CD + BC×DA = (5×7) + (6×8) = 35+48 = 83.",
    "topic": "Mathematics"
  },
  {
    "id": "competitive-s3-q14",
    "number": 89,
    "grade": "Competitive",
    "title": "Mathematics Olympiad · 14",
    "prompt": "In how many ways can 20 identical chocolates be distributed among 4 children such that each child receives at least 2 but no more than 8 chocolates?",
    "hint": "Look for a useful identity, invariant, or extremal case.",
    "answer": "231\n\nSubstituting yᵢ=xᵢ−2 (so 0≤yᵢ≤6) transforms the condition to y₁+y₂+y₃+y₄=12. Without the upper bound, solutions = C(12+3,3)=C(15,3)=455. Subtract cases where some yᵢ≥7 (via yᵢ'=yᵢ−7): for each of the 4 variables, remaining solutions = C(5+3,3)=C(8,3)=56, giving 4×56=224 to subtract (no double-counting is possible since two variables can't both exceed 6 when the total is only 12). Valid distributions = 455−224 = 231.",
    "topic": "Mathematics"
  },
  {
    "id": "competitive-s3-q15",
    "number": 90,
    "grade": "Competitive",
    "title": "Mathematics Olympiad · 15",
    "prompt": "Find the sum: 1/(1×2) + 1/(2×3) + 1/(3×4) + … + 1/(19×20).",
    "hint": "Look for a useful identity, invariant, or extremal case.",
    "answer": "19/20\n\nEach term telescopes: 1/(n(n+1)) = 1/n − 1/(n+1). The sum collapses to 1/1 − 1/20 = 19/20.",
    "topic": "Mathematics"
  },
  {
    "id": "competitive-s3-q16",
    "number": 91,
    "grade": "Competitive",
    "title": "Mathematics Olympiad · 16",
    "prompt": "Find the number of trailing zeros when 15! is written in BASE 12.",
    "hint": "Look for a useful identity, invariant, or extremal case.",
    "answer": "5 trailing zeros\n\n12 = 2²×3, so the number of trailing zeros equals min(⌊v₂(15!)/2⌋, v₃(15!)), where v₂ and v₃ are the exponents of 2 and 3 in 15!. v₂(15!) = ⌊15/2⌋+⌊15/4⌋+⌊15/8⌋ = 7+3+1 = 11. v₃(15!) = ⌊15/3⌋+⌊15/9⌋ = 5+1 = 6. min(⌊11/2⌋, 6) = min(5,6) = 5.",
    "topic": "Mathematics"
  },
  {
    "id": "competitive-s3-q17",
    "number": 92,
    "grade": "Competitive",
    "title": "Mathematics Olympiad · 17",
    "prompt": "A triangle has sides 9, 10, and 17. Find its inradius.",
    "hint": "Look for a useful identity, invariant, or extremal case.",
    "answer": "2\n\nSemi-perimeter s = (9+10+17)/2 = 18. Area = √(s(s−a)(s−b)(s−c)) = √(18×9×8×1) = √1296 = 36. Inradius r = Area/s = 36/18 = 2.",
    "topic": "Mathematics"
  },
  {
    "id": "competitive-s3-q18",
    "number": 93,
    "grade": "Competitive",
    "title": "Mathematics Olympiad · 18",
    "prompt": "Find the minimum value of x²+y² given x+y=10, first for positive real x,y, and then for positive INTEGER x,y with x≠y.",
    "hint": "Look for a useful identity, invariant, or extremal case.",
    "answer": "Real minimum = 50 (at x=y=5); integer (x≠y) minimum = 52 (at x=4,y=6)\n\nFor reals, by symmetry (or Cauchy-Schwarz/QM-AM), the minimum occurs at x=y=5, giving x²+y²=50. For positive integers with x≠y, the closest possible pair to (5,5) is (4,6) [or (6,4)], giving 16+36=52, which is smaller than any other integer pair (e.g. (3,7) gives 58).",
    "topic": "Mathematics"
  },
  {
    "id": "competitive-s3-q19",
    "number": 94,
    "grade": "Competitive",
    "title": "Mathematics Olympiad · 19",
    "prompt": "From a group of 6 men and 4 women, a committee of 5 is formed with AT LEAST 2 women. In how many ways can this be done?",
    "hint": "Look for a useful identity, invariant, or extremal case.",
    "answer": "186\n\nSumming over w=2,3,4 women: w=2: C(4,2)×C(6,3)=6×20=120; w=3: C(4,3)×C(6,2)=4×15=60; w=4: C(4,4)×C(6,1)=1×6=6. Total = 120+60+6 = 186.",
    "topic": "Mathematics"
  },
  {
    "id": "competitive-s3-q20",
    "number": 95,
    "grade": "Competitive",
    "title": "Mathematics Olympiad · 20",
    "prompt": "Find the remainder when 3^100 is divided by 101 (given that 101 is a prime number).",
    "hint": "Look for a useful identity, invariant, or extremal case.",
    "answer": "1\n\nBy Fermat's Little Theorem, since 101 is prime and gcd(3,101)=1, we have 3^100 ≡ 1 (mod 101).",
    "topic": "Mathematics"
  },
  {
    "id": "competitive-s4-q1",
    "number": 96,
    "grade": "Competitive",
    "title": "General Knowledge · 1",
    "prompt": "Consider the following statements regarding the Indian Constitution:\n1. The Right to Property was a Fundamental Right until removed by the 44th Constitutional Amendment Act, 1978, becoming a legal right under Article 300-A.\n2. Directive Principles of State Policy are justiciable, meaning courts can directly enforce them.\n3. The Ninth Schedule (Article 31-B) was originally added to protect land reform laws from judicial review.\nWhich of the statements given above is/are correct?",
    "hint": "Check each statement independently before combining your choices.",
    "answer": "Statement 2 is false: Directive Principles are explicitly non-justiciable under Article 37; they guide governance but cannot be enforced by courts.",
    "topic": "General Knowledge",
    "kind": "mcq",
    "options": [
      "1 and 3 only",
      "2 only",
      "1, 2 and 3",
      "1 only"
    ],
    "correctOptionIndex": 0
  },
  {
    "id": "competitive-s4-q2",
    "number": 97,
    "grade": "Competitive",
    "title": "General Knowledge · 2",
    "prompt": "Consider the following pairs:\n1. Quit India Movement — 1942\n2. Cripps Mission — 1942\n3. Cabinet Mission Plan — 1946\n4. Poona Pact — 1932\nHow many of the above pairs are correctly matched?",
    "hint": "Check each statement independently before combining your choices.",
    "answer": "the Quit India Movement (August 1942), Cripps Mission (March 1942), Cabinet Mission Plan (1946), and Poona Pact between Gandhi and Ambedkar (1932) are all correctly dated.",
    "topic": "General Knowledge",
    "kind": "mcq",
    "options": [
      "One",
      "Two",
      "Three",
      "All four"
    ],
    "correctOptionIndex": 3
  },
  {
    "id": "competitive-s4-q3",
    "number": 98,
    "grade": "Competitive",
    "title": "General Knowledge · 3",
    "prompt": "Consider the following statements about Indian rivers:\n1. The Narmada and the Tapi are the only two major peninsular rivers that flow from east to west, draining into the Arabian Sea via estuaries rather than deltas.\n2. The Godavari, called the 'Dakshin Ganga', is the largest peninsular river by both length and basin size.\n3. The Chambal is a direct tributary of the Ganga.\nWhich of the statements given above is/are correct?",
    "hint": "Check each statement independently before combining your choices.",
    "answer": "Statement 3 is incorrect: the Chambal is a tributary of the Yamuna, which itself joins the Ganga; the Chambal does not join the Ganga directly.",
    "topic": "General Knowledge",
    "kind": "mcq",
    "options": [
      "1 only",
      "1 and 2 only",
      "2 and 3 only",
      "1, 2 and 3"
    ],
    "correctOptionIndex": 1
  },
  {
    "id": "competitive-s4-q4",
    "number": 99,
    "grade": "Competitive",
    "title": "General Knowledge · 4",
    "prompt": "Consider the following statements regarding Emergency provisions under the Indian Constitution:\n1. A National Emergency under Article 352 can be proclaimed only on grounds of war, external aggression, or armed rebellion.\n2. The term 'internal disturbance' in Article 352 was replaced by 'armed rebellion' through the 44th Constitutional Amendment Act.\n3. A Proclamation of Emergency must be approved by both Houses of Parliament within one month of its issue.\nWhich of the statements given above is/are correct?",
    "hint": "Check each statement independently before combining your choices.",
    "answer": "all three statements accurately describe the post-44th Amendment position on Article 352, which tightened the grounds and procedural safeguards for declaring a National Emergency (a response to the perceived misuse of Emergency powers in 1975–77).",
    "topic": "General Knowledge",
    "kind": "mcq",
    "options": [
      "1 and 2 only",
      "2 and 3 only",
      "1 and 3 only",
      "1, 2 and 3"
    ],
    "correctOptionIndex": 3
  },
  {
    "id": "competitive-s4-q5",
    "number": 100,
    "grade": "Competitive",
    "title": "General Knowledge · 5",
    "prompt": "Consider the following statements on fiscal terms used in the Union Budget:\n1. Fiscal deficit is the excess of total expenditure over total receipts excluding borrowings.\n2. Revenue deficit occurs when revenue expenditure exceeds revenue receipts.\n3. Primary deficit equals the fiscal deficit minus interest payments.\nWhich of the statements given above is/are correct?",
    "hint": "Check each statement independently before combining your choices.",
    "answer": "all three are standard, correct definitions used in Indian public finance.",
    "topic": "General Knowledge",
    "kind": "mcq",
    "options": [
      "1 and 2 only",
      "2 and 3 only",
      "1 and 3 only",
      "1, 2 and 3"
    ],
    "correctOptionIndex": 3
  },
  {
    "id": "competitive-s4-q6",
    "number": 101,
    "grade": "Competitive",
    "title": "General Knowledge · 6",
    "prompt": "Consider the following statements about the Government of India Act, 1935:\n1. It introduced provincial autonomy for the first time.\n2. It provided for an All-India Federation, which never actually came into being.\n3. It abolished dyarchy at the provincial level while introducing a form of dyarchy at the Centre.\nWhich of the statements given above is/are correct?",
    "hint": "Check each statement independently before combining your choices.",
    "answer": "the 1935 Act ended provincial dyarchy (replacing it with provincial autonomy) but introduced dyarchy for the first time at the central/federal level for certain subjects; the proposed federation never materialised as too few princely states acceded.",
    "topic": "General Knowledge",
    "kind": "mcq",
    "options": [
      "1 and 2 only",
      "2 and 3 only",
      "1 and 3 only",
      "1, 2 and 3"
    ],
    "correctOptionIndex": 3
  },
  {
    "id": "competitive-s4-q7",
    "number": 102,
    "grade": "Competitive",
    "title": "General Knowledge · 7",
    "prompt": "Consider the following statements:\n1. Diamond and graphite are both allotropes of carbon, but graphite conducts electricity while diamond does not, owing to differences in bonding.\n2. In graphite, each carbon atom is covalently bonded to three others, leaving one delocalised electron per atom that permits conduction.\n3. Diamond is denser than graphite because of its three-dimensional tetrahedral bonding.\nWhich of the statements given above is/are correct?",
    "hint": "Check each statement independently before combining your choices.",
    "answer": "all three statements correctly describe the structural basis for the differing physical properties of these two carbon allotropes.",
    "topic": "General Knowledge",
    "kind": "mcq",
    "options": [
      "1 and 2 only",
      "2 and 3 only",
      "1 and 3 only",
      "1, 2 and 3"
    ],
    "correctOptionIndex": 3
  },
  {
    "id": "competitive-s4-q8",
    "number": 103,
    "grade": "Competitive",
    "title": "General Knowledge · 8",
    "prompt": "Consider the following statements regarding the Supreme Court of India:\n1. A Supreme Court judge can be removed only by a Presidential order following an address by each House of Parliament, supported by a special majority.\n2. The Supreme Court has original, appellate, and advisory jurisdiction.\n3. The right to move the Supreme Court under Article 32 for enforcement of Fundamental Rights can never be suspended, even during a National Emergency.\nWhich of the statements given above is/are correct?",
    "hint": "Check each statement independently before combining your choices.",
    "answer": "Statement 3 is incorrect: under Article 359, the President may suspend the right to move courts for the enforcement of most Fundamental Rights during a National Emergency; only Articles 20 and 21 are explicitly protected from such suspension.",
    "topic": "General Knowledge",
    "kind": "mcq",
    "options": [
      "1 and 2 only",
      "2 and 3 only",
      "1 and 3 only",
      "1, 2 and 3"
    ],
    "correctOptionIndex": 0
  },
  {
    "id": "competitive-s4-q9",
    "number": 104,
    "grade": "Competitive",
    "title": "General Knowledge · 9",
    "prompt": "Consider the following statements about the Indian monsoon:\n1. The southwest monsoon contributes roughly 70–80% of India's total annual rainfall.\n2. The Tamil Nadu coast receives most of its rainfall from the northeast (retreating) monsoon rather than the southwest monsoon.\n3. A 'break' in the monsoon refers to a prolonged dry spell during the rainy season, often linked to a shift in the monsoon trough.\nWhich of the statements given above is/are correct?",
    "hint": "Check each statement independently before combining your choices.",
    "answer": "all three are accurate and commonly tested facts about the Indian monsoon system.",
    "topic": "General Knowledge",
    "kind": "mcq",
    "options": [
      "1 and 2 only",
      "2 and 3 only",
      "1 and 3 only",
      "1, 2 and 3"
    ],
    "correctOptionIndex": 3
  },
  {
    "id": "competitive-s4-q10",
    "number": 105,
    "grade": "Competitive",
    "title": "General Knowledge · 10",
    "prompt": "Consider the following statements on monetary policy tools used by the RBI:\n1. Statutory Liquidity Ratio (SLR) is the percentage of a bank's net demand and time liabilities that must be kept as liquid assets WITH THE RBI.\n2. Cash Reserve Ratio (CRR) requires banks to keep a percentage of deposits as reserves with the RBI, on which no interest is earned.\n3. An increase in the Repo Rate makes borrowing costlier for commercial banks, typically leading to higher lending rates for consumers.\nWhich of the statements given above is/are correct?",
    "hint": "Check each statement independently before combining your choices.",
    "answer": "Statement 1 is incorrect: unlike CRR, the SLR is maintained by banks THEMSELVES (as cash, gold, or approved government securities), not deposited with the RBI. This distinction is a frequently tested point.",
    "topic": "General Knowledge",
    "kind": "mcq",
    "options": [
      "1 and 2 only",
      "2 and 3 only",
      "1 and 3 only",
      "1, 2 and 3"
    ],
    "correctOptionIndex": 1
  },
  {
    "id": "competitive-s4-q11",
    "number": 106,
    "grade": "Competitive",
    "title": "General Knowledge · 11",
    "prompt": "Consider the following statements:\n1. The Indian National Congress was founded in 1885 by Allan Octavian Hume, a retired British civil servant.\n2. The Muslim League was founded in 1906 in Dhaka.\n3. The Ghadar Party was founded in the United States in 1913, mainly by Indian immigrants, aiming to overthrow British rule through armed revolution.\nWhich of the statements given above is/are correct?",
    "hint": "Check each statement independently before combining your choices.",
    "answer": "all three statements are well-established facts of the Indian nationalist movement.",
    "topic": "General Knowledge",
    "kind": "mcq",
    "options": [
      "1 and 2 only",
      "2 and 3 only",
      "1 and 3 only",
      "1, 2 and 3"
    ],
    "correctOptionIndex": 3
  },
  {
    "id": "competitive-s4-q12",
    "number": 107,
    "grade": "Competitive",
    "title": "General Knowledge · 12",
    "prompt": "Consider the following statements regarding the 73rd Constitutional Amendment Act, 1992:\n1. It gave constitutional status to Panchayati Raj Institutions by adding Part IX to the Constitution.\n2. It mandates reservation of not less than one-third of total seats for women in Panchayats.\n3. It mandates a uniform three-tier structure of Panchayats in every state, regardless of population.\nWhich of the statements given above is/are correct?",
    "hint": "Check each statement independently before combining your choices.",
    "answer": "Statement 3 is incorrect: states with a population below 20 lakh MAY choose not to have the intermediate (middle) tier of Panchayats, so a uniform three-tier structure is not mandatory everywhere.",
    "topic": "General Knowledge",
    "kind": "mcq",
    "options": [
      "1 and 2 only",
      "2 and 3 only",
      "1 and 3 only",
      "1, 2 and 3"
    ],
    "correctOptionIndex": 0
  },
  {
    "id": "competitive-s4-q13",
    "number": 108,
    "grade": "Competitive",
    "title": "General Knowledge · 13",
    "prompt": "Consider the following statements:\n1. A body's weight is identical at the equator and at the poles because its mass does not change.\n2. Astronauts in an orbiting spacecraft experience weightlessness because there is no gravity in space.\n3. The acceleration due to gravity (g) is slightly greater at the poles than at the equator, due to Earth's oblate shape and its rotation.\nWhich of the statements given above is/are correct?",
    "hint": "Check each statement independently before combining your choices.",
    "answer": "Statement 1 confuses mass with weight (weight = mass × g, and g varies with location, so weight is NOT identical everywhere). Statement 2 is a common misconception: gravity is still substantial at orbital altitude; weightlessness results from continuous free-fall while in orbit, not the absence of gravity.",
    "topic": "General Knowledge",
    "kind": "mcq",
    "options": [
      "1 only",
      "2 only",
      "3 only",
      "1 and 3 only"
    ],
    "correctOptionIndex": 2
  },
  {
    "id": "competitive-s4-q14",
    "number": 109,
    "grade": "Competitive",
    "title": "General Knowledge · 14",
    "prompt": "Consider the following statements about Indian soils:\n1. Black (regur) soil, ideal for cotton cultivation, forms from the weathering of Deccan trap (basaltic) rocks.\n2. Laterite soil forms due to intense leaching under high temperature and heavy rainfall, and is typically poor in nitrogen and phosphorus.\n3. Alluvial soil of the Indo-Gangetic plains is generally deficient in nitrogen but rich in potash and lime.\nWhich of the statements given above is/are correct?",
    "hint": "Check each statement independently before combining your choices.",
    "answer": "all three statements correctly describe the formation and characteristics of these major Indian soil types.",
    "topic": "General Knowledge",
    "kind": "mcq",
    "options": [
      "1 and 2 only",
      "2 and 3 only",
      "1 and 3 only",
      "1, 2 and 3"
    ],
    "correctOptionIndex": 3
  },
  {
    "id": "competitive-s4-q15",
    "number": 110,
    "grade": "Competitive",
    "title": "General Knowledge · 15",
    "prompt": "Consider the following statements:\n1. A Money Bill can be introduced only in the Lok Sabha, not the Rajya Sabha.\n2. The Rajya Sabha can amend or reject a Money Bill, though its changes are not binding on the Lok Sabha.\n3. If the Speaker of the Lok Sabha certifies a Bill as a Money Bill, that certification is final and ordinarily cannot be questioned in a court of law.\nWhich of the statements given above is/are correct?",
    "hint": "Check each statement independently before combining your choices.",
    "answer": "Statement 2 is incorrect: the Rajya Sabha cannot amend or reject a Money Bill; it may only make recommendations within 14 days, which the Lok Sabha is free to accept or reject entirely.",
    "topic": "General Knowledge",
    "kind": "mcq",
    "options": [
      "1 and 2 only",
      "2 and 3 only",
      "1 and 3 only",
      "1, 2 and 3"
    ],
    "correctOptionIndex": 2
  },
  {
    "id": "competitive-s4-q16",
    "number": 111,
    "grade": "Competitive",
    "title": "General Knowledge · 16",
    "prompt": "Consider the following statements:\n1. Cost-push inflation occurs when rising production costs (such as wages or raw materials) lead producers to raise prices.\n2. Demand-pull inflation occurs when aggregate demand in the economy outpaces aggregate supply.\n3. Stagflation refers to a situation of simultaneous high inflation and high economic growth.\nWhich of the statements given above is/are correct?",
    "hint": "Check each statement independently before combining your choices.",
    "answer": "Statement 3 is incorrect: stagflation refers to high inflation combined with high UNEMPLOYMENT and stagnant (low or negative) growth, not high growth — this combination is what makes it a policy paradox.",
    "topic": "General Knowledge",
    "kind": "mcq",
    "options": [
      "1 and 2 only",
      "2 and 3 only",
      "1 and 3 only",
      "1, 2 and 3"
    ],
    "correctOptionIndex": 0
  },
  {
    "id": "competitive-s4-q17",
    "number": 112,
    "grade": "Competitive",
    "title": "General Knowledge · 17",
    "prompt": "Consider the following statements about the Constituent Assembly of India:\n1. It was constituted under the Cabinet Mission Plan of 1946.\n2. Dr. Rajendra Prasad was its President, while Dr. B. R. Ambedkar chaired the Drafting Committee.\n3. It took exactly two years to complete the drafting and adoption of the Constitution.\nWhich of the statements given above is/are correct?",
    "hint": "Check each statement independently before combining your choices.",
    "answer": "Statement 3 is incorrect: the Assembly took 2 years, 11 months, and 18 days (first meeting 9 December 1946; Constitution adopted 26 November 1949), not exactly two years.",
    "topic": "General Knowledge",
    "kind": "mcq",
    "options": [
      "1 and 2 only",
      "2 and 3 only",
      "1 and 3 only",
      "1, 2 and 3"
    ],
    "correctOptionIndex": 0
  },
  {
    "id": "competitive-s4-q18",
    "number": 113,
    "grade": "Competitive",
    "title": "General Knowledge · 18",
    "prompt": "Consider the following statements:\n1. The Karakoram Pass connects Ladakh with Xinjiang, China.\n2. The Nathu La and Jelep La passes connect Sikkim with the Tibet Autonomous Region of China.\n3. The Radcliffe Line demarcates the boundary between India and Myanmar.\nWhich of the statements given above is/are correct?",
    "hint": "Check each statement independently before combining your choices.",
    "answer": "Statement 3 is incorrect: the Radcliffe Line demarcated the India-Pakistan (and India-East Pakistan/Bangladesh) boundary in 1947; the India-Myanmar boundary was demarcated separately.",
    "topic": "General Knowledge",
    "kind": "mcq",
    "options": [
      "1 and 2 only",
      "2 and 3 only",
      "1 and 3 only",
      "1, 2 and 3"
    ],
    "correctOptionIndex": 0
  },
  {
    "id": "competitive-s4-q19",
    "number": 114,
    "grade": "Competitive",
    "title": "General Knowledge · 19",
    "prompt": "Consider the following statements regarding amendment of the Indian Constitution under Article 368:\n1. Some provisions can be amended by a simple parliamentary majority, without invoking the special Article 368 procedure.\n2. Amendments affecting the federal structure require ratification by at least half of the State Legislatures, in addition to a special majority in Parliament.\n3. The 'basic structure' doctrine, limiting Parliament's amending power, was laid down in the Kesavananda Bharati case (1973).\nWhich of the statements given above is/are correct?",
    "hint": "Check each statement independently before combining your choices.",
    "answer": "all three statements correctly describe India's three-tier constitutional amendment procedure and the basic structure doctrine.",
    "topic": "General Knowledge",
    "kind": "mcq",
    "options": [
      "1 and 2 only",
      "2 and 3 only",
      "1 and 3 only",
      "1, 2 and 3"
    ],
    "correctOptionIndex": 3
  }
] satisfies PuzzleDef[];
