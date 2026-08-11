import type { PuzzleDef } from './types';
import { COMPETITIVE_PUZZLES } from './competitive-catalog';

/**
 * Class XI & XII puzzles sourced from EduBite puzzle pack.
 * Answers unlock the calendar day AFTER the puzzle is shown.
 */
export const ORIGINAL_PUZZLES: PuzzleDef[] = [
  {
    id: "three-switches",
    number: 1,
    grade: "XI",
    title: "The Three Switches",
    prompt:
      "Three switches outside a closed room control three bulbs inside. You may enter the room only once. How will you identify which switch controls each bulb?",
    hint: "Heat can carry information that light cannot.",
    answer:
      "Turn on switch 1 for several minutes, then turn it off. Turn on switch 2 and enter. The glowing bulb belongs to switch 2, the warm bulb to switch 1, and the cold bulb to switch 3.",
    topic: "Logic",
  },
  {
    id: "wrong-labels",
    number: 2,
    grade: "XI",
    title: "The Wrong Labels",
    prompt:
      "Three boxes are labelled Apples, Oranges, and Apples & Oranges. Every label is wrong. You may pick one fruit from only one box. How can you correctly label all three boxes?",
    hint: "Start with the label that claims a mix — it cannot be a mix.",
    answer:
      "Pick from the box labelled Apples & Oranges. Since its label is wrong, it contains only one kind of fruit. Use that fruit to identify the box, then determine the remaining two by elimination.",
    topic: "Logic",
  },
  {
    id: "average-speed-trap",
    number: 3,
    grade: "XI",
    title: "The Average-Speed Trap",
    prompt:
      "A student travels from home to school at 30 km/h and returns along the same route at 60 km/h. What is the average speed for the entire journey?",
    hint: "Average speed is total distance ÷ total time — not the mean of the two speeds.",
    answer: "40 km/h, not 45 km/h.",
    topic: "Math",
  },
  {
    id: "missing-square",
    number: 4,
    grade: "XI",
    title: "The Missing Square",
    prompt:
      "A square has side length 10 cm. Its four corners are cut off by identical right-angled triangles with legs of 2 cm each. What percentage of the original area remains?",
    hint: "Original area = 100 cm². Each triangle removes ½ × 2 × 2 = 2 cm².",
    answer:
      "Original area 100 cm². Four triangles remove 8 cm². Remaining area 92 cm², or 92%.",
    topic: "Geometry",
  },
  {
    id: "clock-overlap",
    number: 5,
    grade: "XI",
    title: "The Clock Puzzle",
    prompt:
      "Between 3:00 p.m. and 4:00 p.m., at what exact time will the hour hand and minute hand overlap?",
    hint: "Hands overlap every 65 ⁵⁄₁₁ minutes; start counting from 3:00.",
    answer: "Approximately 3:16:21.8 p.m.",
    topic: "Math",
  },
  {
    id: "falling-objects",
    number: 6,
    grade: "XI",
    title: "The Falling Objects Puzzle",
    prompt:
      "A heavy ball and a light ball are dropped simultaneously from the same height in a vacuum. Which reaches the ground first? What happens if the heavy ball and light ball are tied together?",
    hint: "In a vacuum there is no air resistance — only gravity.",
    answer:
      "Both reach together in a vacuum. Tying them together does not make the combination fall faster; all objects have the same gravitational acceleration in a vacuum.",
    topic: "Physics",
  },
  {
    id: "number-machine",
    number: 7,
    grade: "XI",
    title: "The Number Machine",
    prompt: "Find the next number:\n\n2,  6,  12,  20,  30,  ?",
    hint: "Look at the gaps between consecutive terms.",
    answer:
      "42. The pattern is n(n + 1): 1×2=2, 2×3=6, 3×4=12, 4×5=20, 5×6=30, 6×7=42.",
    topic: "Math",
  },
  {
    id: "candle-puzzle",
    number: 8,
    grade: "XI",
    title: "The Candle Puzzle",
    prompt:
      "Two candles have equal lengths. One burns completely in four hours and the other in five hours. They are lit together. After how much time will one candle be exactly twice as long as the other?",
    hint: "Set remaining lengths as functions of time and solve B = 2A.",
    answer:
      "After 10/3 hours (3 hours 20 minutes). At that moment the slower-burning candle is twice as long as the faster one.",
    topic: "Math",
  },
  {
    id: "infinite-hotel",
    number: 9,
    grade: "XII",
    title: "The Infinite Hotel",
    prompt:
      "A hotel has infinitely many rooms, and every room is occupied. One new guest arrives. Can the hotel accommodate the guest without asking anyone to leave?",
    hint: "Infinity plus one is still infinity — but you may need to reshuffle.",
    answer:
      "Yes. Move the guest in room n to room n + 1 for every n. Room 1 becomes free for the new guest.",
    topic: "Math",
  },
  {
    id: "two-rope",
    number: 10,
    grade: "XII",
    title: "The Two-Rope Puzzle",
    prompt:
      "You have two ropes. Each rope takes exactly 60 minutes to burn, but neither burns at a uniform rate. How can you measure exactly 45 minutes?",
    hint: "Lighting both ends of a rope finishes it in half the time.",
    answer:
      "Light rope A at both ends and rope B at one end. Rope A finishes in 30 minutes. At that moment, light the second end of rope B. Its remaining portion takes 15 minutes. Total: 45 minutes.",
    topic: "Logic",
  },
  {
    id: "probability-boys",
    number: 11,
    grade: "XII",
    title: "The Probability Puzzle",
    prompt:
      "A family has two children. You are told that at least one child is a boy. What is the probability that both children are boys?",
    hint: "List equally likely ordered outcomes: BB, BG, GB, GG.",
    answer:
      "Assuming boys and girls are equally likely and birth order matters, the possibilities given at least one boy are BB, BG, GB. Therefore the probability both are boys is 1/3.",
    topic: "Probability",
  },
  {
    id: "calculus-limit",
    number: 12,
    grade: "XII",
    title: "The Calculus Challenge",
    prompt:
      "Without directly expanding, determine the value of\n\nlim(x → 0)  sin(x) / x",
    hint: "A standard first-principles / sandwich-theorem limit.",
    answer: "The limit equals 1.",
    topic: "Calculus",
  },
  {
    id: "charged-drop",
    number: 13,
    grade: "XII",
    title: "The Charged-Drop Puzzle",
    prompt:
      "A charged oil drop remains stationary between two horizontal charged plates. If the charge on the drop is doubled while everything else remains unchanged, what happens to the drop?",
    hint: "At rest, electric force balanced weight. Change one side of the balance.",
    answer:
      "The electric force doubles while the weight remains unchanged, so the drop accelerates in the direction of the electric force.",
    topic: "Physics",
  },
  {
    id: "circuit-bypass",
    number: 14,
    grade: "XII",
    title: "The Circuit Puzzle",
    prompt:
      "Two identical bulbs are connected in series to a battery. A wire is then connected directly across one bulb. What happens to both bulbs?",
    hint: "A wire across a bulb is a short circuit for that branch.",
    answer:
      "The bulb bypassed by the wire goes out. The other bulb becomes brighter because the total resistance of the circuit decreases.",
    topic: "Physics",
  },
  {
    id: "radioactive-fraction",
    number: 15,
    grade: "XII",
    title: "The Radioactive Puzzle",
    prompt:
      "A radioactive sample has a half-life of 10 years. After 30 years, what fraction remains? Can the sample ever become exactly zero?",
    hint: "30 years = 3 half-lives.",
    answer:
      "One-eighth remains (½)³. Mathematically, radioactive material approaches zero but does not become exactly zero after any finite time.",
    topic: "Physics",
  },
  {
    id: "maximum-product",
    number: 16,
    grade: "XII",
    title: "The Maximum-Product Puzzle",
    prompt:
      "Two positive numbers have a fixed sum of 20. What should the numbers be so that their product is maximum?",
    hint: "For a fixed sum, the product peaks when the numbers are equal.",
    answer: "The numbers should be 10 and 10.",
    topic: "Math",
  },
];

export const PUZZLES: PuzzleDef[] = [
  ...ORIGINAL_PUZZLES,
  ...COMPETITIVE_PUZZLES,
];

export const PUZZLE_MAP: Record<string, PuzzleDef> = Object.fromEntries(
  PUZZLES.map((p) => [p.id, p]),
);
